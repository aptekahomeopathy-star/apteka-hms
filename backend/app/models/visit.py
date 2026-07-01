from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
    )

    visit_date = Column(Date, nullable=False)

    chief_complaint = Column(Text)
    diagnosis = Column(Text)
presenting_complaints = Column(Text)

history_of_present_illness = Column(Text)

past_history = Column(Text)

family_history = Column(Text)

personal_history = Column(Text)

mental_generals = Column(Text)

physical_generals = Column(Text)

investigation = Column(Text)

medicine_days = Column(Integer)
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
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    patient = relationship("Patient")
