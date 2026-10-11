# Severity definitions and ranking utilities

SEVERITY_LEVELS = {
    "INFO": 1,
    "LOW": 2,
    "MEDIUM": 3,
    "HIGH": 4,
    "CRITICAL": 5
}


def compare_severity(sev1: str, sev2: str) -> int:
    """
    Compares two severity levels.
    Returns:
       >0 if sev1 is higher than sev2
        0 if equal
       <0 if sev1 is lower than sev2
    """
    v1 = SEVERITY_LEVELS.get(sev1.upper(), 1)
    v2 = SEVERITY_LEVELS.get(sev2.upper(), 1)
    return v1 - v2


def get_highest_severity(severities: list[str]) -> str:
    """Returns the highest severity from a list."""
    if not severities:
        return "INFO"
    return max(severities, key=lambda s: SEVERITY_LEVELS.get(s.upper(), 1))
