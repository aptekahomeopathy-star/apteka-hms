from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Text,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    case_number = Column(String(20), unique=True, nullable=False)

    disease_name = Column(String(150), nullable=False)

    chief_complaint = Column(Text)

    diagnosis = Column(Text)

    case_status = Column(
        String(30),
        default="Active"
    )

    opened_on = Column(Date)

    closed_on = Column(Date)

    remarks = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    patient = relationship(
        "Patient",
        back_populates="cases"
    )

    visits = relationship(
        "Visit",
        back_populates="case",
        cascade="all, delete-orphan"
    )