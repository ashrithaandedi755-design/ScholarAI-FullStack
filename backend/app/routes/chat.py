from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_current_user
from app.models.student_profile import StudentProfile
from app.models.scholarship import Scholarship
from app.services.gemini_service import ask_gemini

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/ask")
def ask_question(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == current_user["user_id"]
    ).first()

    scholarships = db.query(Scholarship).all()

    scholarship_data = []

    for scholarship in scholarships:
        scholarship_data.append({
            "id": scholarship.id,
            "name": scholarship.name,
            "provider": scholarship.provider,
            "amount": scholarship.amount,
            "deadline": scholarship.deadline,
            "min_income": scholarship.min_income,
            "max_income": scholarship.max_income,
            "required_state": scholarship.required_state,
            "required_category": scholarship.required_category,
            "required_education": scholarship.required_education
        })

    answer = ask_gemini(
        request.message,
        profile,
        scholarship_data
    )

    return {
        "reply": answer
    }