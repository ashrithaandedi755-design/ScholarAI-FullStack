from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import admin_required

from app.models.user import User
from app.models.scholarship import Scholarship
from app.models.application import Application
from app.models.saved_scholarship import SavedScholarship


router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def get_admin_stats(
    current_user=Depends(admin_required),
    db: Session = Depends(get_db)
):
    total_students = (
        db.query(User)
        .filter(User.role == "student")
        .count()
    )

    total_scholarships = (
        db.query(Scholarship)
        .count()
    )

    total_applications = (
        db.query(Application)
        .count()
    )

    total_saved_scholarships = (
        db.query(SavedScholarship)
        .count()
    )

    return {
        "total_students": total_students,
        "total_scholarships": total_scholarships,
        "total_applications": total_applications,
        "total_saved_scholarships": total_saved_scholarships
    }

@router.get("/students")
def get_students(
    current_user=Depends(admin_required),
    db: Session = Depends(get_db)
):
    students = (
        db.query(User)
        .filter(User.role == "student")
        .all()
    )

    result = []

    for student in students:
        result.append({
            "id": student.id,
            "name": student.name,
            "email": student.email
        })

    return {
        "count": len(result),
        "students": result
    }