from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.schemas.profile_schema import ProfileCreate
from app.dependencies import get_current_user


router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# CREATE PROFILE
# =========================================================

@router.post("/")
def create_profile(
    request: ProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    existing_profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id
            == current_user["user_id"]
        )
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    profile = StudentProfile(
        user_id=current_user["user_id"],
        education=request.education,
        state=request.state,
        category=request.category,
        income=request.income
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    user = (
        db.query(User)
        .filter(
            User.id
            == current_user["user_id"]
        )
        .first()
    )

    return {
        "message": "Profile created successfully",
        "id": profile.id,
        "user_id": profile.user_id,
        "name": user.name if user else "Student",
        "education": profile.education,
        "state": profile.state,
        "category": profile.category,
        "income": profile.income
    }


# =========================================================
# GET PROFILE
# =========================================================

@router.get("/")
def get_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id
            == current_user["user_id"]
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    user = (
        db.query(User)
        .filter(
            User.id
            == current_user["user_id"]
        )
        .first()
    )

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": user.name if user else "Student",
        "education": profile.education,
        "state": profile.state,
        "category": profile.category,
        "income": profile.income
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@router.put("/")
def update_profile(
    request: ProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id
            == current_user["user_id"]
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    profile.education = request.education
    profile.state = request.state
    profile.category = request.category
    profile.income = request.income

    db.commit()
    db.refresh(profile)

    user = (
        db.query(User)
        .filter(
            User.id
            == current_user["user_id"]
        )
        .first()
    )

    return {
        "message": "Profile updated successfully",
        "id": profile.id,
        "user_id": profile.user_id,
        "name": user.name if user else "Student",
        "education": profile.education,
        "state": profile.state,
        "category": profile.category,
        "income": profile.income
    }