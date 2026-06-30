from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Numeric, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(20), unique=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    date_of_birth = Column(Date)
    occupation = Column(String(100))
    chief_complaint = Column(Text)
    past_history = Column(Text)
    family_history = Column(Text)
    personal_history = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    appointments = relationship("Appointment", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    bills = relationship("Bill", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default="scheduled")
    notes = Column(Text)
    follow_up_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="appointments")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    prescription_date = Column(DateTime(timezone=True), server_default=func.now())
    chief_complaint = Column(Text)
    symptoms = Column(Text)
    miasmatic_analysis = Column(Text)
    repertorization = Column(Text)
    medicine_name = Column(String(200))
    potency = Column(String(50))
    dosage = Column(String(100))
    frequency = Column(String(100))
    duration = Column(String(100))
    diet_advice = Column(Text)
    follow_up_instructions = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="prescriptions")
    appointment = relationship("Appointment", back_populates="prescription")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(20), unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    bill_date = Column(DateTime(timezone=True), server_default=func.now())
    consultation_fee = Column(Numeric(10, 2), default=0)
    medicine_cost = Column(Numeric(10, 2), default=0)
    other_charges = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), default=0)
    paid_amount = Column(Numeric(10, 2), default=0)
    payment_mode = Column(String(50))
    status = Column(String(20), default="pending")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="bills")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_mode = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
