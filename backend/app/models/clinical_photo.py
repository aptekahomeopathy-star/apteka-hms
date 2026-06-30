from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class ClinicalPhoto(Base):
    __tablename__ = "clinical_photos"

    id = Column(Integer, primary_key=True, index=True)

    visit_id = Column(
        Integer,
        ForeignKey("visits.id"),
        nullable=False
    )

    photo_type = Column(
        String(50),
        nullable=False
    )
    # Before / Follow-up / Recovery / Lab Report / X-ray

    body_part = Column(String(100))

    image_path = Column(String(255), nullable=False)

    caption = Column(Text)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    visit = relationship(
        "Visit",
        back_populates="photos"
    )