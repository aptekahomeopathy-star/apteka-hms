from fastapi import FastAPI
from app.routers.patients import router as patient_router

app = FastAPI(
    title="APTEKA HMS",
    version="1.0.0"
)

app.include_router(patient_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to APTEKA HMS"}