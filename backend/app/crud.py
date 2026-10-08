from typing import List, Optional
from sqlalchemy.orm import Session
from . import models, schemas


def get_opportunities(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[models.Opportunity]:
    """Retrieve all opportunities, optionally filtered by status."""
    query = db.query(models.Opportunity)
    if status:
        query = query.filter(models.Opportunity.status == status)
    return query.order_by(models.Opportunity.id.desc()).offset(skip).limit(limit).all()


def get_opportunity(db: Session, opportunity_id: int) -> Optional[models.Opportunity]:
    """Retrieve a single opportunity by its ID."""
    return db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()


def create_opportunity(db: Session, opportunity: schemas.OpportunityCreate) -> models.Opportunity:
    """Create a new opportunity record in the database."""
    data = opportunity.model_dump()
    if hasattr(data.get("status"), "value"):
        data["status"] = data["status"].value
    db_opportunity = models.Opportunity(**data)
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    return db_opportunity


def update_opportunity(
    db: Session,
    db_opportunity: models.Opportunity,
    opportunity_update: schemas.OpportunityUpdate
) -> models.Opportunity:
    """Update all fields of an existing opportunity."""
    update_data = opportunity_update.model_dump()
    for field, value in update_data.items():
        if field == "status" and hasattr(value, "value"):
            value = value.value
        setattr(db_opportunity, field, value)
    db.commit()
    db.refresh(db_opportunity)
    return db_opportunity


def delete_opportunity(db: Session, db_opportunity: models.Opportunity) -> None:
    """Delete an opportunity from the database."""
    db.delete(db_opportunity)
    db.commit()
