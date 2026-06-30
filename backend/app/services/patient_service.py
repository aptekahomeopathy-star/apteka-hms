from datetime import datetime

def generate_patient_id(last_number: int) -> str:
    """
    Example:
    APT-26-000001
    """

    year = datetime.now().strftime("%y")

    running = str(last_number + 1).zfill(6)

    return f"APT-{year}-{running}"