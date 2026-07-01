from sqlalchemy.orm import Session
from app.models.patient import Patient


def get_last_patient(db: Session):
    return db.query(Patient).order_by(Patient.id.desc()).first()


def create_patient(db: Session, patient: Patient):
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def get_all_patients(db: Session):
    return (
        db.query(Patient)
        .order_by(Patient.id.desc())
        .all()
    )


def get_patient_by_id(db: Session, patient_id: int):
    return (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )


def update_patient(db: Session, patient_id: int, data: dict):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        return None

    for key, value in data.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)

    return patient