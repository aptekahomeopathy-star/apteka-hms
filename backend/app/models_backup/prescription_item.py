from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)
from sqlalchemy.orm import relationship

from app.database import Base


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True)

    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id"),
        nullable=False
    )

    medicine_name = Column(String(150), nullable=False)

    potency = Column(String(50))

    dosage_form = Column(String(50))      # Pills / Drops / Tablets / Syrup

    dose = Column(String(100))            # 4 Pills

    frequency = Column(String(100))       # TDS / BD / HS

    days = Column(Integer)

    quantity = Column(String(50))

    instructions = Column(String(255))

    prescription = relationship(
        "Prescription",
        back_populates="medicines"
    )