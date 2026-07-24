"""Domain-specific exceptions, mapped to HTTP status codes at the router layer."""


class ExpenseNotFoundError(Exception):
    """Raised when an operation targets an expense id that does not exist."""
