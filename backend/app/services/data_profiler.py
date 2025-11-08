"""Utility helpers for generating lightweight dataset profiles.

The production version of InsightIQ will eventually rely on a much richer
profiling pipeline.  For the purposes of this exercise we keep the
implementation pragmatic and dependency free: the profiler loads a sample of
rows from the dataset table and derives summary statistics which can later be
consumed by the insight generator or other services.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.utils.validators import clamp_limit, ensure_safe_identifier


@dataclass
class ColumnProfile:
    """Container for column level profiling information."""

    name: str
    dtype: str
    null_count: int
    unique_count: int
    sample_values: List[Any]
    statistics: Dict[str, Any]
    top_categories: List[Dict[str, Any]]


class DataProfiler:
    """Generate descriptive statistics for a dataset."""

    MAX_SAMPLE_SIZE = 10_000

    @staticmethod
    def _load_dataframe(dataset: Dataset, db: Session, sample_size: int) -> pd.DataFrame:
        table_name = ensure_safe_identifier(dataset.table_name)
        requested = clamp_limit(sample_size, 1, DataProfiler.MAX_SAMPLE_SIZE)
        total_rows = int(dataset.row_count or requested)
        limit = min(requested, max(total_rows, 1))

        engine = db.get_bind()
        if engine is None:
            raise RuntimeError("Database session is not bound to an engine")

        with engine.connect() as conn:
            query = text(f'SELECT * FROM "{table_name}" LIMIT :limit')
            frame = pd.read_sql_query(query, conn, params={"limit": limit})

        return frame

    @staticmethod
    def build_profile(dataset: Dataset, db: Session, sample_size: int = 2000) -> Dict[str, Any]:
        """Return a dictionary with column level statistics for *dataset*.

        ``sample_size`` controls how many rows are analysed.  The function never
        raises on empty datasets; instead it returns an empty structure which is
        easier for API consumers to handle gracefully.
        """

        if dataset.row_count == 0:
            return {
                "row_count": 0,
                "column_count": 0,
                "columns": [],
                "correlations": [],
            }

        frame = DataProfiler._load_dataframe(dataset, db, sample_size)
        if frame.empty:
            return {
                "row_count": dataset.row_count,
                "column_count": len(dataset.columns or []),
                "columns": [],
                "correlations": [],
            }

        columns: List[ColumnProfile] = []
        numeric_frame = frame.select_dtypes(include=["number"]).copy()

        for column in frame.columns:
            series = frame[column]
            dtype = str(series.dtype)
            null_count = int(series.isna().sum())
            unique_count = int(series.nunique(dropna=True))
            sample_values = []
            for value in series.dropna().unique()[:5]:
                if pd.isna(value):
                    sample_values.append(None)
                    continue
                python_value = value.item() if hasattr(value, "item") else value
                sample_values.append(python_value)

            statistics: Dict[str, Any] = {}
            top_categories: List[Dict[str, Any]] = []

            if pd.api.types.is_numeric_dtype(series):
                statistics = {
                    "min": float(series.min()) if not series.isna().all() else None,
                    "max": float(series.max()) if not series.isna().all() else None,
                    "mean": float(series.mean()) if not series.isna().all() else None,
                    "median": float(series.median()) if not series.isna().all() else None,
                    "std": float(series.std()) if not series.isna().all() else None,
                }
            else:
                # Identify the most common categories for categorical columns.
                value_counts = series.astype(str).value_counts(dropna=True).head(5)
                total = int(series.dropna().shape[0]) or 1
                top_categories = []
                for index, count in value_counts.items():
                    value = index.item() if hasattr(index, "item") else index
                    top_categories.append(
                        {"value": value, "count": int(count), "ratio": float(count) / total}
                    )

            columns.append(
                ColumnProfile(
                    name=column,
                    dtype=dtype,
                    null_count=null_count,
                    unique_count=unique_count,
                    sample_values=sample_values,
                    statistics=statistics,
                    top_categories=top_categories,
                )
            )

        correlations: List[Dict[str, Any]] = []
        if numeric_frame.shape[1] >= 2:
            corr_matrix = numeric_frame.corr(numeric_only=True)
            processed = set()
            for col_a in corr_matrix.columns:
                for col_b in corr_matrix.columns:
                    if col_a == col_b:
                        continue
                    key = tuple(sorted((col_a, col_b)))
                    if key in processed:
                        continue
                    processed.add(key)
                    corr_value = corr_matrix.loc[col_a, col_b]
                    if pd.notna(corr_value):
                        correlations.append(
                            {
                                "column_x": col_a,
                                "column_y": col_b,
                                "value": float(corr_value),
                            }
                        )

        return {
            "row_count": int(dataset.row_count),
            "column_count": len(frame.columns),
            "columns": [column.__dict__ for column in columns],
            "correlations": correlations,
        }
