from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.scholarship import Scholarship
from app.models.saved_scholarship import SavedScholarship
from app.models.application import Application
from app.models.document import Document

from app.routes import auth
from app.routes import profile
from app.routes import scholarship
from app.routes import eligibility
from app.routes import recommendation
from app.routes import saved_scholarship
from app.routes import application
from app.routes import document
from app.routes import chat
from app.routes import admin


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="ScholarAI API",
    description="Scholarship recommendation and student assistance API",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home route
@app.get("/")
def home():
    return {
        "message": "ScholarAI backend is running"
    }


# Authentication
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)


# Student Profile
app.include_router(
    profile.router,
    prefix="/profile",
    tags=["Profile"]
)


# Scholarships
app.include_router(
    scholarship.router,
    prefix="/scholarship",
    tags=["Scholarship"]
)


# Eligibility
app.include_router(
    eligibility.router,
    prefix="/eligibility",
    tags=["Eligibility"]
)


# Recommendations
app.include_router(
    recommendation.router,
    prefix="/recommendation",
    tags=["Recommendation"]
)


# Saved Scholarships
app.include_router(
    saved_scholarship.router,
    prefix="/saved",
    tags=["Saved Scholarships"]
)


# Application Tracker
app.include_router(
    application.router,
    prefix="/application",
    tags=["Applications"]
)


# Document Checklist
app.include_router(
    document.router,
    prefix="/document",
    tags=["Documents"]
)


# AI Assistant
app.include_router(
    chat.router,
    prefix="/chat",
    tags=["AI Chat"]
)

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"]
)