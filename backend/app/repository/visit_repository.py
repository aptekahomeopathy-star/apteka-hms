from sqlalchemy.orm import Session

from app.models.visit import Visit


def create_visit(db: Session, visit: Visit):
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


def get_visits_by_patient(db: Session, patient_id: int):
    return (
        db.query(Visit)
        .filter(Visit.patient_id == patient_id)
        .order_by(Visit.id.desc())
        .all()
    )


def get_visit_by_id(db: Session, visit_id: int):
    return (
        db.query(Visit)
        .filter(Visit.id == visit_id)
        .first()
    )
def update_visit(db: Session, visit_id: int, data: dict):
    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id)
        .first()
    )

    if not visit:
        return None

    for key, value in data.items():
        setattr(visit, key, value)

    db.commit()
    db.refresh(visit)

    return visit


def delete_visit(db: Session, visit_id: int):
    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id)
        .first()
    )

    if not visit:
        return False

    db.delete(visit)
    db.commit()

    return True