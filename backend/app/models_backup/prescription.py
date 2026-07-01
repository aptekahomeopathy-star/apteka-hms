from sqlalchemy import (
    Column,
    Integer,
    Text,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)

    visit_id = Column(
        Integer,
        ForeignKey("visits.id"),
        nullable=False
    )

    remarks = Column(Text)

    diet_advice = Column(Text)

    lifestyle_advice = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    visit = relationship(
        "Visit",
        back_populates="prescription"
    )

    medicines = relationship(
        "PrescriptionItem",
        back_populates="prescription",
        cascade="all, delete-orphan"
    )