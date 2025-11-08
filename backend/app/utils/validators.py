"""Utility validation helpers used across the InsightIQ backend.

The backend dynamically builds SQL queries based on user provided input such
as dataset names and column identifiers.  To keep those interactions safe we
provide a couple of lightweight validators that make sure identifiers only
contain characters that are allowed in PostgreSQL quoted identifiers and that
numeric parameters stay within sensible bounds.  The helpers are intentionally
simple so they can be reused anywhere without creating new dependencies.
"""

from __future__ import annotations

import re
from typing import Iterable

_IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def is_safe_identifier(identifier: str) -> bool:
    """Return ``True`` when *identifier* only contains safe characters.

    We rely on cleaned column names (see :mod:`app.utils.csv_parser`) which are
    already lower-case and use underscores.  The helper is still valuable for
    sanity checking dynamically created identifiers or values that originate
    from untrusted sources such as natural language questions.
    """

    if identifier is None:
        return False
    return bool(_IDENTIFIER_PATTERN.match(identifier))


def ensure_safe_identifier(identifier: str) -> str:
    """Validate that *identifier* is safe and return it.

    ``ValueError`` is raised when the identifier contains characters outside of
    ``[A-Za-z0-9_]`` or starts with a digit.  Downstream code can catch the
    error and present a user-friendly validation message.
    """

    if not is_safe_identifier(identifier):
        raise ValueError(f"Unsafe identifier: {identifier!r}")
    return identifier


def clamp_limit(value: int, minimum: int = 1, maximum: int = 10_000) -> int:
    """Clamp *value* to the inclusive ``[minimum, maximum]`` range.

    The backend exposes user-configurable limits (for example pagination size
    or preview limits).  This helper ensures that excessively large values are
    never propagated to the database layer where they could cause performance
    issues.
    """

    if value is None:
        raise ValueError("Limit value cannot be None")

    if value < minimum:
        return minimum
    if value > maximum:
        return maximum
    return value


def select_first(iterable: Iterable[str], fallback: str | None = None) -> str | None:
    """Return the first element from *iterable* or *fallback* when empty."""

    for item in iterable:
        return item
    return fallback
