from fastapi import FastAPI
from app.database import initialize_database
app = FastAPI(
    title="Student Success Agent",
    description="Agentic AI platform for student academic and career management",
    version="1.0.0"
)

initialize_database()

@app.get("/")
def home():
    return {
        "message": "Student Success Agent backend is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }