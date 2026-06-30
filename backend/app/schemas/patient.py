from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


class PatientCreate(BaseModel):
    old_opd_no: Optional[str] = None

    full_name: str

    father_or_husband_name: Optional[str] = None

    date_of_birth: Optional[date] = None

    age: Optional[int] = None

    gender: Optional[str] = None

    phone: str

    alternate_phone: Optional[str] = None

    email: Optional[EmailStr] = None

    address: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    pincode: Optional[str] = None

    occupation: Optional[str] = None

    marital_status: Optional[str] = None

    blood_group: Optional[str] = None

    referred_by: Optional[str] = None


class PatientResponse(PatientCreate):
    patient_id: str
    registration_date: date

    class Config:
        from_attributes = True