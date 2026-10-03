from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_current_user
from app.models.application import Application
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
# REQUEST SCHEMAS
# --------------------------------------------------

class ApplicationCreate(BaseModel):
    scholarship_id: int


class ApplicationStatusUpdate(BaseModel):
    status: str


# --------------------------------------------------
# CREATE APPLICATION
# POST /application/
# --------------------------------------------------

@router.post("/")
def create_application(
    request: ApplicationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    # Check whether scholarship exists
    scholarship = (
        db.query(Scholarship)
        .filter(
            Scholarship.id == request.scholarship_id
        )
        .first()
    )

    if not scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    # Check whether application already exists
    existing = (
        db.query(Application)
        .filter(
            Application.user_id == user_id,
            Application.scholarship_id == request.scholarship_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Application already exists"
        )

    # Create application
    application = Application(
        user_id=user_id,
        scholarship_id=request.scholarship_id,
        status="Not Applied"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application added successfully",
        "application_id": application.id
    }


# --------------------------------------------------
# GET APPLICATIONS
# GET /application/
# --------------------------------------------------

@router.get("/")
def get_applications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    applications = (
        db.query(Application)
        .filter(
            Application.user_id == user_id
        )
        .all()
    )

    result = []

    for application in applications:

        scholarship = (
            db.query(Scholarship)
            .filter(
                Scholarship.id == application.scholarship_id
            )
            .first()
        )

        result.append({
            "id": application.id,
            "scholarship_id": application.scholarship_id,
            "scholarship_name": (
                scholarship.name
                if scholarship
                else "Unknown Scholarship"
            ),
            "status": application.status
        })

    return {
        "count": len(result),
        "applications": result
    }


# --------------------------------------------------
# UPDATE APPLICATION STATUS
# PUT /application/{application_id}
# --------------------------------------------------

@router.put("/{application_id}")
def update_application_status(
    application_id: int,
    request: ApplicationStatusUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    allowed_statuses = [
        "Not Applied",
        "Applied",
        "Under Review",
        "Selected",
        "Rejected"
    ]

    # Check status
    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status"
        )

    # Find application belonging to current user
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == user_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    # Update status
    application.status = request.status

    db.commit()
    db.refresh(application)

    return {
        "message": "Application status updated successfully",
        "application_id": application.id,
        "status": application.status
    }


# --------------------------------------------------
# DELETE APPLICATION
# DELETE /application/{application_id}
# --------------------------------------------------

@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == user_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()

    return {
        "message": "Application deleted successfully"
    }