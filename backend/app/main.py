from fastapi import FastAPI

from app.database import Base, engine

# Import all models so SQLAlchemy registers them
import app.models

from app.routers.patients import router as patient_router

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="APTEKA HMS",
    version="2.0.0"
)

app.include_router(patient_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "APTEKA HMS API",
        "status": "running"
    }
