class DomainError(Exception):
    """A business-rule violation; mapped to an HTTP error by the API layer."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


class NotFound(DomainError):
    def __init__(self, what: str):
        super().__init__("not_found", f"{what} not found.", 404)
