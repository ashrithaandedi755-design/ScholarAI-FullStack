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


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# CREATE FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="ScholarAI API",
    description="Scholarship recommendation and student assistance API",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://scholar-ai-full-stack.vercel.app",
    "https://scholar-ai-full-stack-7p4e6fpic-ashritha1.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():
    return {
        "message": "ScholarAI backend is running"
    }


# =========================================================
# AUTHENTICATION
# =========================================================

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# STUDENT PROFILE
# =========================================================

app.include_router(
    profile.router,
    prefix="/profile",
    tags=["Profile"]
)


# =========================================================
# SCHOLARSHIPS
# =========================================================

app.include_router(
    scholarship.router,
    prefix="/scholarship",
    tags=["Scholarship"]
)


# =========================================================
# ELIGIBILITY
# =========================================================

app.include_router(
    eligibility.router,
    prefix="/eligibility",
    tags=["Eligibility"]
)


# =========================================================
# RECOMMENDATIONS
# =========================================================

app.include_router(
    recommendation.router,
    prefix="/recommendation",
    tags=["Recommendation"]
)


# =========================================================
# SAVED SCHOLARSHIPS
# =========================================================

app.include_router(
    saved_scholarship.router,
    prefix="/saved",
    tags=["Saved Scholarships"]
)


# =========================================================
# APPLICATION TRACKER
# =========================================================

app.include_router(
    application.router,
    prefix="/application",
    tags=["Applications"]
)


# =========================================================
# DOCUMENT CHECKLIST
# =========================================================

app.include_router(
    document.router,
    prefix="/document",
    tags=["Documents"]
)


# =========================================================
# AI ASSISTANT
# =========================================================

app.include_router(
    chat.router,
    prefix="/chat",
    tags=["AI Chat"]
)


# =========================================================
# ADMIN
# =========================================================

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"]
)