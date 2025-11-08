"""Translate natural language questions into executable SQL queries."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.models.query import Query
from app.models.user import User
from app.utils.validators import clamp_limit, ensure_safe_identifier, select_first


AGGREGATION_KEYWORDS: Dict[str, Dict[str, str]] = {
    "count": {"expression": "COUNT(*)", "alias": "total_count", "chart": "metric"},
    "average": {"expression": "AVG({column})", "alias": "average_{alias}", "chart": "bar"},
    "avg": {"expression": "AVG({column})", "alias": "average_{alias}", "chart": "bar"},
    "mean": {"expression": "AVG({column})", "alias": "average_{alias}", "chart": "bar"},
    "sum": {"expression": "SUM({column})", "alias": "sum_{alias}", "chart": "bar"},
    "total": {"expression": "SUM({column})", "alias": "sum_{alias}", "chart": "bar"},
    "max": {"expression": "MAX({column})", "alias": "max_{alias}", "chart": "metric"},
    "highest": {"expression": "MAX({column})", "alias": "max_{alias}", "chart": "metric"},
    "min": {"expression": "MIN({column})", "alias": "min_{alias}", "chart": "metric"},
    "lowest": {"expression": "MIN({column})", "alias": "min_{alias}", "chart": "metric"},
}


@dataclass
class GeneratedQuery:
    sql: str
    chart_suggestion: Optional[Dict[str, str]] = None
    description: Optional[str] = None


class QueryGenerator:
    """Generate SQL queries using heuristics."""

    MAX_LIMIT = 5_000

    @staticmethod
    def _match_column(question: str, columns: List[str]) -> Optional[str]:
        for column in columns:
            if column.lower() in question:
                return column
        return select_first(columns)

    @staticmethod
    def _default_select(table_name: str, limit: int = 100) -> GeneratedQuery:
        safe_table = ensure_safe_identifier(table_name)
        safe_limit = clamp_limit(limit, 1, QueryGenerator.MAX_LIMIT)
        sql = f'SELECT * FROM "{safe_table}" LIMIT {safe_limit}'
        description = f"Showing the first {safe_limit} rows from '{safe_table}'."
        return GeneratedQuery(sql=sql, chart_suggestion={"type": "table"}, description=description)

    @classmethod
    def _aggregation_query(
        cls,
        keyword: str,
        matched_column: Optional[str],
        table_name: str,
        available_columns: List[str],
    ) -> Optional[GeneratedQuery]:
        safe_table = ensure_safe_identifier(table_name)

        if keyword == "count":
            sql = f'SELECT COUNT(*) AS total_count FROM "{safe_table}"'
            description = f"Calculated total row count for '{safe_table}'."
            return GeneratedQuery(
                sql=sql,
                chart_suggestion={"type": "metric", "field": "total_count"},
                description=description,
            )

        column = matched_column or select_first(available_columns)
        if not column:
            return None

        safe_column = ensure_safe_identifier(column)
        config = AGGREGATION_KEYWORDS[keyword]
        expression = config["expression"].format(column=f'"{safe_column}"')
        alias = config["alias"].format(alias=safe_column)
        sql = f'SELECT {expression} AS "{alias}" FROM "{safe_table}"'

        chart_type = config.get("chart", "metric")

        description = (
            f"Calculated {keyword} for column '{safe_column}'." if keyword != "count" else ""
        )

        return GeneratedQuery(
            sql=sql,
            chart_suggestion={"type": chart_type, "field": safe_column, "alias": alias},
            description=description or None,
        )

    @classmethod
    def generate_sql(cls, question: str, dataset: Dataset) -> GeneratedQuery:
        """Return a :class:`GeneratedQuery` for a natural language *question*."""

        question_normalised = question.lower()
        columns: List[str] = []
        for meta in dataset.columns or []:
            name = meta.get("name") if isinstance(meta, dict) else None
            if not name:
                continue
            try:
                columns.append(ensure_safe_identifier(name))
            except ValueError:
                continue

        # Try to match aggregation keywords first.
        for keyword in AGGREGATION_KEYWORDS.keys():
            if keyword in question_normalised:
                matched_column = cls._match_column(question_normalised, columns)
                generated = cls._aggregation_query(
                    keyword=keyword,
                    matched_column=matched_column,
                    table_name=dataset.table_name,
                    available_columns=columns,
                )
                if generated:
                    return generated

        # DISTINCT queries.
        if "distinct" in question_normalised or "unique" in question_normalised:
            column = cls._match_column(question_normalised, columns)
            if column:
                safe_table = ensure_safe_identifier(dataset.table_name)
                safe_column = ensure_safe_identifier(column)
                sql = f'SELECT DISTINCT "{safe_column}" FROM "{safe_table}" ORDER BY "{safe_column}"'
                return GeneratedQuery(sql=sql, chart_suggestion={"type": "table"})

        # Basic filters of the form "where column = value".
        match = re.search(r"(where|for) ([a-z0-9_]+) = ([a-z0-9_]+)", question_normalised)
        if match:
            column = match.group(2)
            value = match.group(3)
            if column in columns:
                safe_table = ensure_safe_identifier(dataset.table_name)
                safe_column = ensure_safe_identifier(column)
                sql = (
                    f'SELECT * FROM "{safe_table}" WHERE "{safe_column}" = ' f"'{value}' LIMIT 200"
                )
                return GeneratedQuery(sql=sql, chart_suggestion={"type": "table"})

        return cls._default_select(dataset.table_name)


class QueryExecutor:
    """Persist queries and return serialisable results."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def execute(self, *, dataset: Dataset, user: User, question: str) -> Tuple[Query, Dict[str, Any]]:
        generated = QueryGenerator.generate_sql(question, dataset)

        if not generated.sql.lower().strip().startswith("select"):
            raise ValueError("Only SELECT statements are allowed")

        start = time.perf_counter()
        result = self.db.execute(text(generated.sql))
        rows = result.mappings().all()
        execution_time_ms = (time.perf_counter() - start) * 1000

        row_dicts = [
            {
                key: QueryExecutor._serialise_value(value)
                for key, value in row.items()
            }
            for row in rows
        ]
        columns = list(result.keys())

        query = Query(
            dataset_id=dataset.id,
            user_id=user.id,
            nl_question=question,
            generated_sql=generated.sql,
            row_count=len(row_dicts),
            execution_time_ms=execution_time_ms,
            status="success",
        )

        self.db.add(query)
        self.db.flush()

        response_payload: Dict[str, Any] = {
            "query_id": query.id,
            "sql": generated.sql,
            "columns": columns,
            "rows": row_dicts,
            "row_count": len(row_dicts),
            "execution_time_ms": execution_time_ms,
            "chart_suggestion": generated.chart_suggestion,
            "insight": generated.description,
        }

        return query, response_payload

    def record_failure(self, *, dataset: Dataset, user: User, question: str, error: Exception) -> Query:
        query = Query(
            dataset_id=dataset.id,
            user_id=user.id,
            nl_question=question,
            generated_sql="",
            row_count=0,
            execution_time_ms=0,
            status="failed",
            error=str(error),
        )
        self.db.add(query)
        self.db.flush()
        return query

    @staticmethod
    def _serialise_value(value: Any) -> Any:
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value
