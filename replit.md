# APTEKA HMS - Homeopathy Management System

A full-stack clinic management application for APTEKA HOMOEOPATHY.

## Tech Stack

- **Frontend:** React + TypeScript, Tailwind CSS, Vite (port 5000)
- **Backend:** FastAPI (Python 3.11), SQLAlchemy ORM (port 8000)
- **Database:** PostgreSQL (Replit managed, via DATABASE_URL)
- **Auth:** JWT tokens (python-jose), bcrypt password hashing

## Project Structure

```
frontend/         React + Vite frontend
  src/
    pages/        Dashboard, Patients, Appointments, Prescriptions, Billing, Expenses, Analytics
    components/   Layout (sidebar navigation)
    hooks/        useAuth
    lib/          api.ts (axios), types.ts

backend/          FastAPI backend
  app/
    routers/      auth, patients, appointments, prescriptions, billing, expenses, analytics
    models/       SQLAlchemy models
    auth.py       JWT + bcrypt auth
    main.py       App entry + static file serving for production
  run.py          Development server (uvicorn on localhost:8000)
```

## Running the App

The "Start application" workflow runs both services:
- Backend: `cd backend && python run.py` → localhost:8000
- Frontend: `cd frontend && npm run dev` → 0.0.0.0:5000

Frontend proxies `/api/*` to backend at `127.0.0.1:8000`.

## First-Time Setup

Register the first account at the login page — it automatically becomes admin.

## Features

- Patient registration & management (with patient ID generation: APT0001)
- Appointments scheduling with follow-up tracking
- Homeopathic prescriptions (medicine, potency, dosage, miasmatic analysis)
- Billing & receipts with payment modes
- Expense tracking by category
- Analytics: monthly revenue charts, gender distribution

## Production Deployment

Build: `cd frontend && npm run build`
Run: `cd backend && gunicorn --bind=0.0.0.0:5000 --workers=2 app.main:app`
(FastAPI serves the built React SPA as static files in production)

## User Preferences

- Use Indian Rupee (₹) for all currency display
- Patient IDs follow format: APT0001, APT0002, etc.
- Bill numbers follow format: BILL202506XXXX
