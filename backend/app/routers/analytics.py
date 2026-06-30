from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date, timedelta
from ..database import get_db
from ..models.models import Patient, Appointment, Bill, Expense, User
from ..schemas import DashboardStats
from ..auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    month_start = today.replace(day=1)

    total_patients = db.query(Patient).count()

    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    today_appointments = db.query(Appointment).filter(
        Appointment.appointment_date >= today_start,
        Appointment.appointment_date <= today_end
    ).count()

    today_revenue = db.query(func.sum(Bill.total_amount)).filter(
        Bill.bill_date >= today_start,
        Bill.bill_date <= today_end,
        Bill.status == "paid"
    ).scalar() or 0

    pending_followups = db.query(Appointment).filter(
        Appointment.follow_up_date >= today,
        Appointment.status != "cancelled"
    ).count()

    month_start_dt = datetime.combine(month_start, datetime.min.time())
    monthly_revenue = db.query(func.sum(Bill.total_amount)).filter(
        Bill.bill_date >= month_start_dt,
        Bill.status == "paid"
    ).scalar() or 0

    monthly_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.expense_date >= month_start
    ).scalar() or 0

    return DashboardStats(
        total_patients=total_patients,
        today_appointments=today_appointments,
        today_revenue=float(today_revenue),
        pending_followups=pending_followups,
        monthly_revenue=float(monthly_revenue),
        monthly_expenses=float(monthly_expenses)
    )


@router.get("/monthly-revenue")
def get_monthly_revenue(
    year: int = datetime.now().year,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        extract('month', Bill.bill_date).label('month'),
        func.sum(Bill.total_amount).label('revenue')
    ).filter(
        extract('year', Bill.bill_date) == year,
        Bill.status == "paid"
    ).group_by(extract('month', Bill.bill_date)).all()

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = {int(r.month): float(r.revenue) for r in results}
    return [{"month": months[i], "revenue": data.get(i + 1, 0)} for i in range(12)]


@router.get("/patient-gender-distribution")
def get_gender_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Patient.gender,
        func.count(Patient.id).label('count')
    ).group_by(Patient.gender).all()
    return [{"gender": r.gender or "unknown", "count": r.count} for r in results]
