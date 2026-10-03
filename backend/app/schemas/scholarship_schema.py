from pydantic import BaseModel
from typing import Optional


class ScholarshipCreate(BaseModel):
    name: str
    provider: str
    description: str
    amount: float
    deadline: str
    eligibility: str
    application_link: str

    # Eligibility rules
    min_income: Optional[float] = None
    max_income: Optional[float] = None
    required_state: Optional[str] = None
    required_category: Optional[str] = None
    required_education: Optional[str] = None