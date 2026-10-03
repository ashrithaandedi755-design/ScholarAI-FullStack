from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id"), nullable=False)

    document_name = Column(String, nullable=False)
    is_ready = Column(Boolean, default=False)