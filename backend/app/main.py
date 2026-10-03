import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal

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

from app.services.auth_service import hash_password


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# INITIALIZE ADMIN AND DEMO SCHOLARSHIPS
# ============================================================

def initialize_data():
    db: Session = SessionLocal()

    try:
        # ----------------------------------------------------
        # ADMIN ACCOUNT
        # ----------------------------------------------------

        admin_email = os.getenv(
            "ADMIN_EMAIL",
            "admin@scholarai.com"
        )

        admin_password = os.getenv(
            "ADMIN_PASSWORD",
            "Admin@123"
        )

        admin_name = os.getenv(
            "ADMIN_NAME",
            "ScholarAI Admin"
        )

        existing_admin = (
            db.query(User)
            .filter(User.email == admin_email)
            .first()
        )

        if existing_admin:
            # Make sure this account is an admin
            existing_admin.role = "admin"

            db.commit()

            print(
                f"Admin account already exists: {admin_email}"
            )

        else:
            new_admin = User(
                name=admin_name,
                email=admin_email,
                password=hash_password(admin_password),
                role="admin"
            )

            db.add(new_admin)
            db.commit()

            print(
                f"Admin account created: {admin_email}"
            )

        # ----------------------------------------------------
        # DEMO SCHOLARSHIPS
        # ----------------------------------------------------

        scholarship_count = db.query(Scholarship).count()

        if scholarship_count == 0:

            demo_scholarships = [

                Scholarship(
                    name="National Scholarship Scheme",
                    provider="Government of India",
                    description=(
                        "Demo scholarship for testing "
                        "ScholarAI scholarship discovery "
                        "and recommendation features."
                    ),
                    amount=50000,
                    deadline="2026-12-31",
                    eligibility=(
                        "Students meeting the scholarship "
                        "eligibility criteria."
                    ),
                    application_link="https://example.com/apply",
                    min_income=None,
                    max_income=None,
                    required_state=None,
                    required_category=None,
                    required_education=None
                ),

                Scholarship(
                    name="Merit Scholarship",
                    provider="Education Foundation",
                    description=(
                        "Demo merit-based scholarship "
                        "for testing ScholarAI."
                    ),
                    amount=75000,
                    deadline="2027-01-15",
                    eligibility=(
                        "Students meeting the scholarship "
                        "eligibility criteria."
                    ),
                    application_link="https://example.com/apply",
                    min_income=None,
                    max_income=None,
                    required_state=None,
                    required_category=None,
                    required_education=None
                ),

                Scholarship(
                    name="Women in Technology Scholarship",
                    provider="Technology Foundation",
                    description=(
                        "Demo technology scholarship "
                        "for testing ScholarAI."
                    ),
                    amount=100000,
                    deadline="2027-02-28",
                    eligibility=(
                        "Students meeting the scholarship "
                        "eligibility criteria."
                    ),
                    application_link="https://example.com/apply",
                    min_income=None,
                    max_income=None,
                    required_state=None,
                    required_category=None,
                    required_education=None
                ),

                Scholarship(
                    name="Karnataka OBC Scholarship",
                    provider="Demo Education Foundation",
                    description=(
                        "Demo scholarship for OBC students "
                        "studying M.Tech in Karnataka."
                    ),
                    amount=60000,
                    deadline="2027-03-31",
                    eligibility=(
                        "M.Tech students from Karnataka "
                        "belonging to the OBC category "
                        "with eligible family income."
                    ),
                    application_link="https://example.com/apply",
                    min_income=100000,
                    max_income=500000,
                    required_state="Karnataka",
                    required_category="OBC",
                    required_education="M.Tech"
                )
            ]

            db.add_all(demo_scholarships)
            db.commit()

            print("4 demo scholarships created.")

        else:
            print(
                f"Scholarships already exist: "
                f"{scholarship_count}"
            )

    except Exception as error:
        db.rollback()
        print("Database initialization error:", error)

    finally:
        db.close()


# Run initialization
initialize_data()


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="ScholarAI API",
    description="Scholarship recommendation and student assistance API",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    # Production frontend + local development
    allow_origins=[
        "https://scholar-ai-full-stack.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    # Allow Vercel preview deployments
    allow_origin_regex=(
        r"^https://scholar-ai-full-stack-[a-zA-Z0-9-]+-ashritha1\.vercel\.app$"
    ),

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME ROUTE
# ============================================================

@app.get("/")
def home():
    return {
        "message": "ScholarAI backend is running"
    }


# ============================================================
# AUTHENTICATION
# ============================================================

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# STUDENT PROFILE
# ============================================================

app.include_router(
    profile.router,
    prefix="/profile",
    tags=["Profile"]
)


# ============================================================
# SCHOLARSHIPS
# ============================================================

app.include_router(
    scholarship.router,
    prefix="/scholarship",
    tags=["Scholarship"]
)


# ============================================================
# ELIGIBILITY
# ============================================================

app.include_router(
    eligibility.router,
    prefix="/eligibility",
    tags=["Eligibility"]
)


# ============================================================
# RECOMMENDATIONS
# ============================================================

app.include_router(
    recommendation.router,
    prefix="/recommendation",
    tags=["Recommendation"]
)


# ============================================================
# SAVED SCHOLARSHIPS
# ============================================================

app.include_router(
    saved_scholarship.router,
    prefix="/saved",
    tags=["Saved Scholarships"]
)


# ============================================================
# APPLICATION TRACKER
# ============================================================

app.include_router(
    application.router,
    prefix="/application",
    tags=["Applications"]
)


# ============================================================
# DOCUMENT CHECKLIST
# ============================================================

app.include_router(
    document.router,
    prefix="/document",
    tags=["Documents"]
)


# ============================================================
# AI ASSISTANT
# ============================================================

app.include_router(
    chat.router,
    prefix="/chat",
    tags=["AI Chat"]
)


# ============================================================
# ADMIN
# ============================================================

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"]
)