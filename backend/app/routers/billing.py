from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, date
from ..database import get_db
from ..models.models import Bill, User
from ..schemas import BillCreate, BillOut
from ..auth import get_current_user

router = APIRouter(prefix="/bills", tags=["billing"])


def generate_bill_number(db: Session) -> str:
    count = db.query(Bill).count()
    today = datetime.now().strftime("%Y%m")
    return f"BILL{today}{(count + 1):04d}"


@router.post("/", response_model=BillOut)
def create_bill(
    bill: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = (bill.consultation_fee or Decimal(0)) + (bill.medicine_cost or Decimal(0)) + (bill.other_charges or Decimal(0))
    bill_number = generate_bill_number(db)
    db_bill = Bill(
        **bill.model_dump(),
        bill_number=bill_number,
        total_amount=total,
        paid_amount=total if bill.status == "paid" else Decimal(0)
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db.query(Bill).options(joinedload(Bill.patient)).filter(Bill.id == db_bill.id).first()


@router.get("/", response_model=List[BillOut])
def get_bills(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Bill).options(joinedload(Bill.patient))
    if patient_id:
        query = query.filter(Bill.patient_id == patient_id)
    if status:
        query = query.filter(Bill.status == status)
    return query.order_by(Bill.bill_date.desc()).offset(skip).limit(limit).all()


@router.get("/{bill_id}", response_model=BillOut)
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bill = db.query(Bill).options(joinedload(Bill.patient)).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.put("/{bill_id}", response_model=BillOut)
def update_bill(
    bill_id: int,
    bill: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    total = (bill.consultation_fee or Decimal(0)) + (bill.medicine_cost or Decimal(0)) + (bill.other_charges or Decimal(0))
    for key, value in bill.model_dump().items():
        setattr(db_bill, key, value)
    db_bill.total_amount = total
    if bill.status == "paid":
        db_bill.paid_amount = total
    db.commit()
    db.refresh(db_bill)
    return db.query(Bill).options(joinedload(Bill.patient)).filter(Bill.id == db_bill.id).first()
