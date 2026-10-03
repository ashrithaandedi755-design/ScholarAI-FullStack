from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_current_user
from app.models.document import Document
from app.models.scholarship import Scholarship


router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Request schemas
# -----------------------------

class DocumentCreate(BaseModel):
    scholarship_id: int
    document_name: str


class DocumentUpdate(BaseModel):
    is_ready: bool


# -----------------------------
# ADD DOCUMENT
# -----------------------------

@router.post("/")
def add_document(
    request: DocumentCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    # Check scholarship
    scholarship = db.query(Scholarship).filter(
        Scholarship.id == request.scholarship_id
    ).first()

    if not scholarship:
        raise HTTPException(
            status_code=404,
            detail="Scholarship not found"
        )

    # Check if same document already exists
    existing_document = db.query(Document).filter(
        Document.user_id == user_id,
        Document.scholarship_id == request.scholarship_id,
        Document.document_name == request.document_name
    ).first()

    if existing_document:
        raise HTTPException(
            status_code=400,
            detail="Document already exists"
        )

    document = Document(
        user_id=user_id,
        scholarship_id=request.scholarship_id,
        document_name=request.document_name,
        is_ready=False
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document added successfully",
        "document_id": document.id,
        "document_name": document.document_name,
        "is_ready": document.is_ready
    }


# -----------------------------
# GET ALL DOCUMENTS
# -----------------------------

@router.get("/")
def get_all_documents(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    documents = db.query(Document).filter(
        Document.user_id == user_id
    ).all()

    result = []

    for document in documents:

        scholarship = db.query(Scholarship).filter(
            Scholarship.id == document.scholarship_id
        ).first()

        result.append({
            "document_id": document.id,
            "scholarship_id": document.scholarship_id,
            "scholarship_name": (
                scholarship.name
                if scholarship
                else "Unknown Scholarship"
            ),
            "document_name": document.document_name,
            "is_ready": document.is_ready
        })

    return {
        "count": len(result),
        "documents": result
    }


# -----------------------------
# GET DOCUMENTS FOR SCHOLARSHIP
# -----------------------------

@router.get("/{scholarship_id}")
def get_documents(
    scholarship_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    documents = db.query(Document).filter(
        Document.user_id == user_id,
        Document.scholarship_id == scholarship_id
    ).all()

    result = []

    for document in documents:

        result.append({
            "document_id": document.id,
            "scholarship_id": document.scholarship_id,
            "document_name": document.document_name,
            "is_ready": document.is_ready
        })

    return {
        "count": len(result),
        "documents": result
    }


# -----------------------------
# UPDATE DOCUMENT
# -----------------------------

@router.put("/{document_id}")
def update_document(
    document_id: int,
    request: DocumentUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document.is_ready = request.is_ready

    db.commit()
    db.refresh(document)

    return {
        "message": "Document updated successfully",
        "document_id": document.id,
        "is_ready": document.is_ready
    }


# -----------------------------
# DELETE DOCUMENT
# -----------------------------

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }