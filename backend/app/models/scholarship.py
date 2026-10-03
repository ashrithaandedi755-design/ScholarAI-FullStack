from sqlalchemy import Column, Integer, String, Float, Text

from app.database import Base


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    provider = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    amount = Column(Float, nullable=False)

    deadline = Column(String, nullable=False)

    eligibility = Column(Text, nullable=False)

    application_link = Column(String, nullable=False)

    min_income = Column(Float, nullable=True)

    max_income = Column(Float, nullable=True)

    required_state = Column(String, nullable=True)

    required_category = Column(String, nullable=True)

    required_education = Column(String, nullable=True)

    # Real scholarship information
    source_name = Column(String, nullable=True)

    source_url = Column(String, nullable=True)

    academic_year = Column(String, nullable=True)