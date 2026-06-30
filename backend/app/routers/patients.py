from datetime import date

from fastapi import APIRouter

from app.schemas.patient import PatientCreate

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post("/")
def register_patient(patient: PatientCreate):

    return {
        "message": "Patient Registered Successfully",
        "patient": patient
    }