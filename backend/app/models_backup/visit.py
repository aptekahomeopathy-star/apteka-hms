from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False
    )
    case = relationship(
        "Case",
        back_populates="visits"
    )
    visit_number = Column(Integer, nullable=False)

    visit_date = Column(Date, nullable=False)

    doctor_name = Column(String(100), nullable=False)

    chief_complaint = Column(Text)

    present_history = Column(Text)

    past_history = Column(Text)

    family_history = Column(Text)

    diagnosis = Column(Text)

    clinical_notes = Column(Text)

    weight = Column(String(20))

    height = Column(String(20))

    blood_pressure = Column(String(20))

    pulse = Column(String(20))

    temperature = Column(String(20))

    medicine_days = Column(Integer, default=0)

    follow_up_date = Column(Date)

    visit_status = Column(String(30), default="Completed")
    prescription = relationship(
        "Prescription",
        back_populates="visit",
        uselist=False,
        cascade="all, delete-orphan"
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    photos = relationship(
        "ClinicalPhoto",
        back_populates="visit",
        cascade="all, delete-orphan"
    )
    patient = relationship(
        "Patient",
        back_populates="visits"
    )
    from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
    from sqlalchemy.sql import func
    from sqlalchemy.orm import relationship

    from app.database import Base


    class Visit(Base):
        __tablename__ = "visits"

        id = Column(Integer, primary_key=True, index=True)

        patient_id = Column(
            Integer,
            ForeignKey("patients.id"),
            nullable=False
        )

        visit_date = Column(Date, nullable=False)

        chief_complaint = Column(Text)

        diagnosis = Column(Text)

        bp = Column(String(20))
        pulse = Column(String(20))
        weight = Column(String(20))
        temperature = Column(String(20))
        spo2 = Column(String(20))

        remarks = Column(Text)

        consultation_fee = Column(Integer)

        follow_up_date = Column(Date)

        created_at = Column(
            DateTime(timezone=True),
            server_default=func.now()
        )

        updated_at = Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now()
        )

        patient = relationship("Patient")