"""High level helper that turns dataset profiles into human readable insights."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List

import math


@dataclass
class GeneratedInsight:
    """Lightweight container used to serialise insights to the database."""

    title: str
    description: str
    insight_type: str
    chart_config: Dict[str, Any] | None = None
    confidence: float | None = None


class InsightGenerator:
    """Generate heuristically derived insights from a dataset profile."""

    MAX_INSIGHTS = 6

    @staticmethod
    def _numeric_insights(profile: Dict[str, Any]) -> Iterable[GeneratedInsight]:
        for column in profile.get("columns", []):
            stats = column.get("statistics") or {}
            if not stats:
                continue

            name = column["name"]
            mean = stats.get("mean")
            minimum = stats.get("min")
            maximum = stats.get("max")
            std = stats.get("std")

            if mean is None and minimum is None and maximum is None:
                continue

            description_bits = []
            if mean is not None:
                description_bits.append(f"an average value of {mean:,.2f}")
            if minimum is not None and maximum is not None:
                description_bits.append(
                    f"a range between {minimum:,.2f} and {maximum:,.2f}"
                )

            description = f"Column '{name}' shows " + ", ".join(description_bits) + "."
            if std is not None and mean not in (0, None):
                variability = abs(std / (mean or 1))
                if variability > 0.8:
                    description += " The data exhibits high variability."  # type: ignore[operator]

            chart_config = {"type": "histogram", "x": name}
            confidence = 0.7 if std and mean else 0.6

            yield GeneratedInsight(
                title=f"Summary statistics for '{name}'",
                description=description,
                insight_type="summary",
                chart_config=chart_config,
                confidence=confidence,
            )

    @staticmethod
    def _categorical_insights(profile: Dict[str, Any]) -> Iterable[GeneratedInsight]:
        for column in profile.get("columns", []):
            top_categories = column.get("top_categories") or []
            if not top_categories:
                continue

            top_entry = top_categories[0]
            if top_entry["ratio"] < 0.4:
                continue

            name = column["name"]
            value = top_entry["value"]
            ratio = top_entry["ratio"] * 100
            description = (
                f"'{value}' is the most common value in '{name}', appearing in approximately"
                f" {ratio:.1f}% of the analysed rows."
            )

            yield GeneratedInsight(
                title=f"Dominant category in '{name}'",
                description=description,
                insight_type="categorical_dominance",
                chart_config={"type": "bar", "x": name, "y": "count"},
                confidence=0.65,
            )

    @staticmethod
    def _correlation_insights(profile: Dict[str, Any]) -> Iterable[GeneratedInsight]:
        correlations = sorted(
            profile.get("correlations", []),
            key=lambda item: abs(item.get("value") or 0),
            reverse=True,
        )

        for entry in correlations:
            value = entry.get("value")
            if value is None or math.isnan(value) or abs(value) < 0.6:
                continue

            col_x = entry.get("column_x")
            col_y = entry.get("column_y")
            strength = "strong" if abs(value) > 0.8 else "moderate"
            trend = "positive" if value > 0 else "negative"

            description = (
                f"There is a {strength} {trend} correlation (r={value:.2f}) between '{col_x}'"
                f" and '{col_y}'. Consider exploring how changes in one column impact the other."
            )

            yield GeneratedInsight(
                title=f"Correlation between '{col_x}' and '{col_y}'",
                description=description,
                insight_type="correlation",
                chart_config={"type": "scatter", "x": col_x, "y": col_y},
                confidence=0.75,
            )

    @classmethod
    def generate(cls, profile: Dict[str, Any], limit: int | None = None) -> List[Dict[str, Any]]:
        """Generate a list of serialisable insight dictionaries.

        ``profile`` should be produced by :class:`app.services.data_profiler.DataProfiler`.
        The result is intentionally concise so it can be returned directly from
        API routes or persisted inside the database.
        """

        final_limit = limit or cls.MAX_INSIGHTS
        insights: List[Dict[str, Any]] = []

        generators = (
            cls._numeric_insights(profile),
            cls._categorical_insights(profile),
            cls._correlation_insights(profile),
        )

        for generator in generators:
            for candidate in generator:
                insights.append(
                    {
                        "title": candidate.title,
                        "description": candidate.description,
                        "insight_type": candidate.insight_type,
                        "chart_config": candidate.chart_config,
                        "confidence": candidate.confidence,
                    }
                )
                if len(insights) >= final_limit:
                    return insights

        return insights
