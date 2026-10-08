from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Enum, func
from .database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    research_area = Column(String(150), nullable=False)
    faculty_name = Column(String(150), nullable=False)
    department = Column(String(150), nullable=False)
    required_skills = Column(Text, nullable=False)
    available_positions = Column(Integer, nullable=False)
    application_deadline = Column(Date, nullable=False)
    status = Column(Enum("Open", "Closed", name="opportunity_status"), nullable=False, default="Open")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
