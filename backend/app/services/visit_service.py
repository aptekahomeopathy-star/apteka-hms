from app.models.visit import Visit


def create_visit(data):
    return Visit(
        patient_id=data.patient_id,
        visit_date=data.visit_date,
        chief_complaint=data.chief_complaint,
        diagnosis=data.diagnosis,
        bp=data.bp,
        pulse=data.pulse,
        weight=data.weight,
        temperature=data.temperature,
        spo2=data.spo2,
        remarks=data.remarks,
        consultation_fee=data.consultation_fee,
        follow_up_date=data.follow_up_date,
    )
