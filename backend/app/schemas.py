from datetime import date, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class OpportunityStatus(str, Enum):
    OPEN = "Open"
    CLOSED = "Closed"


class OpportunityBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Title of the research opportunity")
    description: str = Field(..., min_length=10, description="Detailed project description")
    research_area: str = Field(..., min_length=2, max_length=150, description="Field or discipline")
    faculty_name: str = Field(..., min_length=2, max_length=150, description="Leading professor or researcher")
    department: str = Field(..., min_length=2, max_length=150, description="Academic department")
    required_skills: str = Field(..., min_length=2, description="Prerequisite skills or qualifications")
    available_positions: int = Field(..., ge=1, description="Number of open slots (minimum 1)")
    application_deadline: date = Field(..., description="Application closing date in YYYY-MM-DD")
    status: OpportunityStatus = Field(default=OpportunityStatus.OPEN, description="Opportunity status: Open or Closed")

    @field_validator("title", "description", "research_area", "faculty_name", "department", "required_skills", mode="before")
    @classmethod
    def strip_and_check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Field cannot be empty or only whitespace")
            return trimmed
        return v


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(OpportunityBase):
    pass


class OpportunityResponse(OpportunityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str
