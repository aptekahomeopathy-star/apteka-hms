from datetime import date

from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.repository.patient_repository import get_last_patient


def generate_patient_id(last_number: int) -> str:
    year = str(date.today().year)[2:]
    return f"APT-{year}-{str(last_number + 1).zfill(6)}"

def generate_registration_number(last_number: int) -> str:
    year = str(date.today().year)[2:]
    return f"REG-{year}-{str(last_number + 1).zfill(6)}"

def create_patient(db: Session, data):

    last_patient = get_last_patient(db)

    if last_patient:
        last_number = last_patient.id
    else:
        last_number = 0

    patient_id = generate_patient_id(last_number)
    registration_number = generate_registration_number(last_number)
    patient = Patient(
        patient_id=patient_id,
        registration_number=registration_number,
        new_opd_no=str(last_number + 1),
        registration_date=date.today(),

        old_opd_no=data.old_opd_no,
        full_name=data.full_name,
        father_or_husband_name=data.father_or_husband_name,
        date_of_birth=data.date_of_birth,
        age=data.age,
        gender=data.gender,
        phone=data.phone,
        alternate_phone=data.alternate_phone,
        email=data.email,
        address=data.address,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        occupation=data.occupation,
        marital_status=data.marital_status,
        blood_group=data.blood_group,
        referred_by=data.referred_by,
        aadhaar_number=data.aadhaar_number,
        emergency_contact=data.emergency_contact,
        chief_complaint=data.chief_complaint,
        diagnosis=data.diagnosis,
        remarks=data.remarks,
        status=data.status,
        profile_photo=data.profile_photo,
    )

    return patient
