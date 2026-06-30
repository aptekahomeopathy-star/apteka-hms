from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
from ..database import get_db
from ..models.models import Appointment, User
from ..schemas import AppointmentCreate, AppointmentOut
from ..auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/", response_model=AppointmentOut)
def create_appointment(
    appt: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_appt = Appointment(**appt.model_dump())
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db.query(Appointment).options(joinedload(Appointment.patient)).filter(Appointment.id == db_appt.id).first()


@router.get("/", response_model=List[AppointmentOut])
def get_appointments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    date_filter: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment).options(joinedload(Appointment.patient))
    if status:
        query = query.filter(Appointment.status == status)
    if date_filter:
        query = query.filter(
            Appointment.appointment_date >= datetime.combine(date_filter, datetime.min.time()),
            Appointment.appointment_date < datetime.combine(date_filter, datetime.max.time())
        )
    return query.order_by(Appointment.appointment_date.desc()).offset(skip).limit(limit).all()


@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).options(joinedload(Appointment.patient)).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int,
    appt: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for key, value in appt.model_dump().items():
        setattr(db_appt, key, value)
    db.commit()
    db.refresh(db_appt)
    return db.query(Appointment).options(joinedload(Appointment.patient)).filter(Appointment.id == db_appt.id).first()


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
    return {"message": "Appointment deleted"}
