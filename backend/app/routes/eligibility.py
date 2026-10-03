from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.student_profile import StudentProfile
from app.models.scholarship import Scholarship
from app.dependencies import get_current_user
from app.services.gemini_service import explain_eligibility

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{scholarship_id}")
def check_eligibility(
    scholarship_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get student's profile
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user["user_id"]
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    # Get scholarship
    scholarship = db.query(Scholarship).filter(
        Scholarship.id == scholarship_id
    ).first()

    if not scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    reasons = []
    eligible = True

    # Check minimum income
    if scholarship.min_income is not None:
        if profile.income < scholarship.min_income:
            eligible = False
            reasons.append(
                "Income is below the minimum requirement"
            )
        else:
            reasons.append(
                "Minimum income requirement satisfied"
            )

    # Check maximum income
    if scholarship.max_income is not None:
        if profile.income > scholarship.max_income:
            eligible = False
            reasons.append(
                "Income exceeds the maximum allowed limit"
            )
        else:
            reasons.append(
                "Maximum income requirement satisfied"
            )

    # Check state
    if scholarship.required_state:
        if profile.state.strip().lower() != scholarship.required_state.strip().lower():
            eligible = False
            reasons.append(
                "State requirement not satisfied"
            )
        else:
            reasons.append(
                "State requirement satisfied"
            )

    # Check category
    if scholarship.required_category:
        if profile.category.strip().lower() != scholarship.required_category.strip().lower():
            eligible = False
            reasons.append(
                "Category requirement not satisfied"
            )
        else:
            reasons.append(
                "Category requirement satisfied"
            )

    # Check education
    if scholarship.required_education:
        if profile.education.strip().lower() != scholarship.required_education.strip().lower():
            eligible = False
            reasons.append(
                "Education requirement not satisfied"
            )
        else:
            reasons.append(
                "Education requirement satisfied"
            )

    # If no specific rules were provided
    if not reasons:
        reasons.append(
            "No specific eligibility rules are configured for this scholarship"
        )

    explanation = explain_eligibility(
    profile,
    scholarship,
    eligible,
    reasons
)

    return {
    "scholarship_id": scholarship.id,
    "eligible": eligible,
    "reasons": reasons,
    "ai_explanation": explanation
}