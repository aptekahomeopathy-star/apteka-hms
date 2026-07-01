@router.post("/")
def register_visit(
    visit: VisitCreate,
    db: Session = Depends(get_db),
):
    new_visit = create_visit(visit)
    saved_visit = save_visit(db, new_visit)
    return saved_visit


@router.get("/patient/{patient_id}")
def list_patient_visits(
    patient_id: int,
    db: Session = Depends(get_db),
):
    return get_visits_by_patient(db, patient_id)

@router.get("/{visit_id}")
def get_visit(
    visit_id: int,
    db: Session = Depends(get_db),
):
    visit = get_visit_by_id(db, visit_id)

    if visit is None:
        raise HTTPException(
            status_code=404,
            detail="Visit not found",
        )

    return visit
    
@router.put("/{visit_id}")
def edit_visit(
    visit_id: int,
    visit: VisitUpdate,
    db: Session = Depends(get_db),
):
    updated = update_visit(
        db,
        visit_id,
        visit.model_dump(exclude_unset=True),
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Visit not found",
        )

    return updated


@router.delete("/{visit_id}")
def remove_visit(
    visit_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_visit(db, visit_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Visit not found",
        )

    return {"message": "Visit deleted successfully"}