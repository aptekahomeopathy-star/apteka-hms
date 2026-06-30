from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..database import get_db
from ..models.models import Prescription, User
from ..schemas import PrescriptionCreate, PrescriptionOut
from ..auth import get_current_user

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


@router.post("/", response_model=PrescriptionOut)
def create_prescription(
    rx: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_rx = Prescription(**rx.model_dump())
    db.add(db_rx)
    db.commit()
    db.refresh(db_rx)
    return db.query(Prescription).options(joinedload(Prescription.patient)).filter(Prescription.id == db_rx.id).first()


@router.get("/", response_model=List[PrescriptionOut])
def get_prescriptions(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Prescription).options(joinedload(Prescription.patient))
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    return query.order_by(Prescription.prescription_date.desc()).offset(skip).limit(limit).all()


@router.get("/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rx = db.query(Prescription).options(joinedload(Prescription.patient)).filter(Prescription.id == prescription_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return rx


@router.put("/{prescription_id}", response_model=PrescriptionOut)
def update_prescription(
    prescription_id: int,
    rx: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_rx = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    for key, value in rx.model_dump().items():
        setattr(db_rx, key, value)
    db.commit()
    db.refresh(db_rx)
    return db.query(Prescription).options(joinedload(Prescription.patient)).filter(Prescription.id == db_rx.id).first()
