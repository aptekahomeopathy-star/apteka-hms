from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PatientCreate, PatientUpdate
from app.services.patient_service import create_patient
from app.repository.patient_repository import (
    create_patient as save_patient,
    get_all_patients,
    get_patient_by_id,
    update_patient,
    search_patients,
)
router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.post("/")
def register_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
):
    new_patient = create_patient(db, patient)
    saved_patient = save_patient(db, new_patient)
    return saved_patient


@router.get("/")
def list_patients(
    db: Session = Depends(get_db),
):
    return get_all_patients(db)
@router.get("/search")
def search_patient(
    q: str,
    db: Session = Depends(get_db),
):
    return search_patients(db, q)

@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    patient = get_patient_by_id(db, patient_id)

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient


@router.put("/{patient_id}")
def edit_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db),
):
    updated = update_patient(
        db,
        patient_id,
        patient.model_dump(exclude_unset=True),
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return updated
