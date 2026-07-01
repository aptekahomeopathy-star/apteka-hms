from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


class PatientCreate(BaseModel):
    # Existing OPD number (old paper register)
    old_opd_no: Optional[str] = None

    # Personal Details
    full_name: str
    father_or_husband_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[str] = None

    # Contact Details
    phone: str
    alternate_phone: Optional[str] = None
    email: Optional[EmailStr] = None

    # Address
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    # Other Details
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    blood_group: Optional[str] = None
    referred_by: Optional[str] = None

    # Identity
    aadhaar_number: Optional[str] = None
    emergency_contact: Optional[str] = None

    # Clinical
    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None
    remarks: Optional[str] = None

    # Status
    status: Optional[str] = "Active"

    # Profile photo
    profile_photo: Optional[str] = None


class PatientUpdate(BaseModel):
    old_opd_no: Optional[str] = None

    full_name: Optional[str] = None
    father_or_husband_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[str] = None

    phone: Optional[str] = None
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

    aadhaar_number: Optional[str] = None
    emergency_contact: Optional[str] = None

    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None
    remarks: Optional[str] = None

    status: Optional[str] = None
    profile_photo: Optional[str] = None


class PatientResponse(PatientCreate):
    patient_id: str
    registration_number: str
    new_opd_no: str
    registration_date: date

    class Config:
        from_attributes = True
