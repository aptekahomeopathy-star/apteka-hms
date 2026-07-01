from datetime import date
from typing import Optional

from pydantic import BaseModel


class VisitCreate(BaseModel):
    patient_id: int

    visit_date: date

    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None

    bp: Optional[str] = None
    pulse: Optional[str] = None
    weight: Optional[str] = None
    temperature: Optional[str] = None
    spo2: Optional[str] = None

    remarks: Optional[str] = None

    consultation_fee: Optional[int] = None

    follow_up_date: Optional[date] = None
class VisitUpdate(BaseModel):
    visit_date: Optional[date] = None

    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None

    presenting_complaints: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    past_history: Optional[str] = None
    family_history: Optional[str] = None
    personal_history: Optional[str] = None
    mental_generals: Optional[str] = None
    physical_generals: Optional[str] = None
    investigation: Optional[str] = None

    bp: Optional[str] = None
    pulse: Optional[str] = None
    weight: Optional[str] = None
    temperature: Optional[str] = None
    spo2: Optional[str] = None

    consultation_fee: Optional[int] = None
    medicine_days: Optional[int] = None
    follow_up_date: Optional[date] = None

    remarks: Optional[str] = None