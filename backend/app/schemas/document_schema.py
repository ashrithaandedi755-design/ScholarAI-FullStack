from pydantic import BaseModel


class DocumentCreate(BaseModel):
    scholarship_id: int
    document_name: str


class DocumentUpdate(BaseModel):
    is_ready: bool