from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.student_profile import StudentProfile
from app.models.scholarship import Scholarship
from app.dependencies import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_recommendations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get student's profile
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user["user_id"]
    ).first()

    if not profile:
        return {
            "message": "Student profile not found",
            "recommendations": []
        }

    # Get all scholarships
    scholarships = db.query(Scholarship).all()

    recommendations = []

    for scholarship in scholarships:

        eligible = True

        # Check minimum income
        if scholarship.min_income is not None:
            if profile.income < scholarship.min_income:
                eligible = False

        # Check maximum income
        if scholarship.max_income is not None:
            if profile.income > scholarship.max_income:
                eligible = False

        # Check state
        if scholarship.required_state:
            if profile.state.strip().lower() != scholarship.required_state.strip().lower():
                eligible = False

        # Check category
        if scholarship.required_category:
            if profile.category.strip().lower() != scholarship.required_category.strip().lower():
                eligible = False

        # Check education
        if scholarship.required_education:
            if profile.education.strip().lower() != scholarship.required_education.strip().lower():
                eligible = False

        # Add eligible scholarship
        if eligible:
            recommendations.append({
                "id": scholarship.id,
                "name": scholarship.name,
                "provider": scholarship.provider,
                "description": scholarship.description,
                "amount": scholarship.amount,
                "deadline": scholarship.deadline,
                "application_link": scholarship.application_link
            })

    return {
        "count": len(recommendations),
        "recommendations": recommendations
    }