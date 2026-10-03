from pydantic import BaseModel


class EligibilityResponse(BaseModel):
    scholarship_id: int
    eligible: bool
    reasons: list[str]