from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    education = Column(String, nullable=False)
    state = Column(String, nullable=False)
    category = Column(String, nullable=False)
    income = Column(Float, nullable=False)

    user = relationship("User", back_populates="student_profile")