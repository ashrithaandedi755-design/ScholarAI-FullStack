from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    education: str
    state: str
    category: str
    income: float = Field(..., ge=0)