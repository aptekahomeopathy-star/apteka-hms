from sqlalchemy.orm import relationship
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text
)
from sqlalchemy.sql import func

from app.database.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    # Permanent Patient Number
    patient_id = Column(String(20), unique=True, nullable=False, index=True)

    # Old paper register number
    old_opd_no = Column(String(20), nullable=True)

    registration_date = Column(Date, nullable=False)

    full_name = Column(String(150), nullable=False)

    father_or_husband_name = Column(String(150))

    date_of_birth = Column(Date)

    age = Column(Integer)

    gender = Column(String(20))

    phone = Column(String(20), index=True)

    alternate_phone = Column(String(20))

    email = Column(String(120))

    address = Column(Text)

    city = Column(String(80))

    state = Column(String(80))

    pincode = Column(String(10))

    occupation = Column(String(80))

    marital_status = Column(String(30))

    blood_group = Column(String(10))

    referred_by = Column(String(100))

    profile_photo = Column(String(255))
    visits = relationship(
        "Visit",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    cases = relationship(
        "Case",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )