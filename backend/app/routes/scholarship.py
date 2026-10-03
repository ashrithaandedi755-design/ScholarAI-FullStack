from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.scholarship import Scholarship
from app.schemas.scholarship_schema import ScholarshipCreate
from app.dependencies import admin_required


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create Scholarship - Admin only
@router.post("/")
def create_scholarship(
    scholarship: ScholarshipCreate,
    current_user=Depends(admin_required),
    db: Session = Depends(get_db)
):
    new_scholarship = Scholarship(
    name=scholarship.name,
    provider=scholarship.provider,
    description=scholarship.description,
    amount=scholarship.amount,
    deadline=scholarship.deadline,
    eligibility=scholarship.eligibility,
    application_link=scholarship.application_link,

    min_income=scholarship.min_income,
    max_income=scholarship.max_income,
    required_state=scholarship.required_state,
    required_category=scholarship.required_category,
    required_education=scholarship.required_education
)

    db.add(new_scholarship)
    db.commit()
    db.refresh(new_scholarship)

    return {
        "message": "Scholarship created successfully",
        "scholarship_id": new_scholarship.id
    }


# Get Scholarships - Students and Admins
@router.get("/")
def get_scholarships(
    search: str = None,
    provider: str = None,
    min_amount: float = None,
    max_amount: float = None,
    sort_by: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Scholarship)

    if search:
        query = query.filter(
            Scholarship.name.ilike(f"%{search}%")
        )

    if provider:
        query = query.filter(
            Scholarship.provider.ilike(f"%{provider}%")
        )

    if min_amount is not None:
        query = query.filter(
            Scholarship.amount >= min_amount
        )

    if max_amount is not None:
        query = query.filter(
            Scholarship.amount <= max_amount
        )

    if sort_by == "amount_asc":
        query = query.order_by(Scholarship.amount.asc())

    elif sort_by == "amount_desc":
        query = query.order_by(Scholarship.amount.desc())

    elif sort_by == "deadline":
        query = query.order_by(Scholarship.deadline.asc())

    skip = (page - 1) * limit

    scholarships = query.offset(skip).limit(limit).all()

    return {
        "page": page,
        "limit": limit,
        "results": scholarships
    }


# Get Single Scholarship
@router.get("/{scholarship_id}")
def get_scholarship(
    scholarship_id: int,
    db: Session = Depends(get_db)
):
    scholarship = db.query(Scholarship).filter(
        Scholarship.id == scholarship_id
    ).first()

    if not scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    return scholarship


# Update Scholarship - Admin only
@router.put("/{scholarship_id}")
def update_scholarship(
    scholarship_id: int,
    scholarship: ScholarshipCreate,
    current_user=Depends(admin_required),
    db: Session = Depends(get_db)
):
    existing_scholarship = db.query(Scholarship).filter(
        Scholarship.id == scholarship_id
    ).first()

    if not existing_scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    existing_scholarship.name = scholarship.name
    existing_scholarship.provider = scholarship.provider
    existing_scholarship.description = scholarship.description
    existing_scholarship.amount = scholarship.amount
    existing_scholarship.deadline = scholarship.deadline
    existing_scholarship.eligibility = scholarship.eligibility
    existing_scholarship.application_link = scholarship.application_link

    existing_scholarship.min_income = scholarship.min_income
    existing_scholarship.max_income = scholarship.max_income
    existing_scholarship.required_state = scholarship.required_state
    existing_scholarship.required_category = scholarship.required_category
    existing_scholarship.required_education = scholarship.required_education

    db.commit()
    db.refresh(existing_scholarship)

    return {
        "message": "Scholarship updated successfully"
    }


# Delete Scholarship - Admin only
@router.delete("/{scholarship_id}")
def delete_scholarship(
    scholarship_id: int,
    current_user=Depends(admin_required),
    db: Session = Depends(get_db)
):
    scholarship = db.query(Scholarship).filter(
        Scholarship.id == scholarship_id
    ).first()

    if not scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    db.delete(scholarship)
    db.commit()

    return {
        "message": "Scholarship deleted successfully"
    }