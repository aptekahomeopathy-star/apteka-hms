from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class PatientCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    chief_complaint: Optional[str] = None
    past_history: Optional[str] = None
    family_history: Optional[str] = None
    personal_history: Optional[str] = None


class PatientOut(PatientCreate):
    id: int
    patient_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    patient_id: int
    appointment_date: datetime
    status: Optional[str] = "scheduled"
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class AppointmentOut(AppointmentCreate):
    id: int
    created_at: datetime
    patient: Optional[PatientOut] = None

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    miasmatic_analysis: Optional[str] = None
    repertorization: Optional[str] = None
    medicine_name: Optional[str] = None
    potency: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    diet_advice: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    notes: Optional[str] = None


class PrescriptionOut(PrescriptionCreate):
    id: int
    prescription_date: datetime
    patient: Optional[PatientOut] = None

    class Config:
        from_attributes = True


class BillCreate(BaseModel):
    patient_id: int
    consultation_fee: Optional[Decimal] = Decimal("0")
    medicine_cost: Optional[Decimal] = Decimal("0")
    other_charges: Optional[Decimal] = Decimal("0")
    payment_mode: Optional[str] = None
    status: Optional[str] = "pending"
    notes: Optional[str] = None


class BillOut(BillCreate):
    id: int
    bill_number: str
    total_amount: Decimal
    paid_amount: Decimal
    bill_date: datetime
    patient: Optional[PatientOut] = None

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    expense_date: date
    category: str
    description: Optional[str] = None
    amount: Decimal
    payment_mode: Optional[str] = None


class ExpenseOut(ExpenseCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_patients: int
    today_appointments: int
    today_revenue: float
    pending_followups: int
    monthly_revenue: float
    monthly_expenses: float
