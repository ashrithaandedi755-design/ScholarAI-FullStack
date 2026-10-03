from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_current_user
from app.models.saved_scholarship import SavedScholarship
from app.models.scholarship import Scholarship


router = APIRouter()


# --------------------------------------------------
# DATABASE DEPENDENCY
# --------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------
# REQUEST SCHEMA
# --------------------------------------------------

class SaveScholarshipRequest(BaseModel):
    scholarship_id: int


# --------------------------------------------------
# SAVE SCHOLARSHIP
# POST /saved/
# --------------------------------------------------

@router.post("/")
def save_scholarship(
    request: SaveScholarshipRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user["user_id"]

    # Check whether scholarship exists
    scholarship = (
        db.query(Scholarship)
        .filter(Scholarship.id == request.scholarship_id)
        .first()
    )

    if not scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    # Check whether already saved
    existing = (
        db.query(SavedScholarship)
        .filter(
            SavedScholarship.user_id == user_id,
            SavedScholarship.scholarship_id == request.scholarship_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Scholarship already saved"
        )

    # Create saved scholarship
    saved = SavedScholarship(
        user_id=user_id,
        scholarship_id=request.scholarship_id
    )

    db.add(saved)
    db.commit()
    db.refresh(saved)

    return {
        "message": "Scholarship saved successfully",
        "saved_id": saved.id
    }


# --------------------------------------------------
# GET SAVED SCHOLARSHIPS
# GET /saved/
# --------------------------------------------------

@router.get("/")
def get_saved_scholarships(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user["user_id"]

    saved_records = (
        db.query(SavedScholarship)
        .filter(
            SavedScholarship.user_id == user_id
        )
        .all()
    )

    result = []

    for saved in saved_records:

        scholarship = (
            db.query(Scholarship)
            .filter(
                Scholarship.id == saved.scholarship_id
            )
            .first()
        )

        if scholarship:

            result.append({
                "saved_id": saved.id,
                "scholarship_id": scholarship.id,
                "name": scholarship.name,
                "provider": scholarship.provider,
                "description": scholarship.description,
                "amount": scholarship.amount,
                "deadline": scholarship.deadline,
                "eligibility": scholarship.eligibility,
                "application_link": scholarship.application_link
            })

    return {
        "count": len(result),
        "saved_scholarships": result
    }


# --------------------------------------------------
# DELETE SAVED SCHOLARSHIP
# DELETE /saved/{saved_id}
# --------------------------------------------------

@router.delete("/{saved_id}")
def delete_saved_scholarship(
    saved_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user["user_id"]

    saved = (
        db.query(SavedScholarship)
        .filter(
            SavedScholarship.id == saved_id,
            SavedScholarship.user_id == user_id
        )
        .first()
    )

    if not saved:
        raise HTTPException(
            status_code=404,
            detail="Saved scholarship not found"
        )

    db.delete(saved)
    db.commit()

    return {
        "message": "Scholarship removed from saved list"
    }