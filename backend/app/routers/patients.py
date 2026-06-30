from fastapi import APIRouter
from app.schemas import PatientCreate

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

@router.post("/")
def register_patient(patient: PatientCreate):
    return {
        "message": "Patient Registered Successfully",
        "patient": patient.model_dump()
    }