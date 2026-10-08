from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])


@router.get("", response_model=List[schemas.OpportunityResponse], status_code=status.HTTP_200_OK)
def read_opportunities(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=200, description="Limit records returned"),
    opportunity_status: Optional[schemas.OpportunityStatus] = Query(None, alias="status", description="Filter by Open or Closed"),
    db: Session = Depends(get_db)
):
    """Retrieve all research opportunities with optional status filter."""
    status_filter = opportunity_status.value if opportunity_status else None
    return crud.get_opportunities(db, skip=skip, limit=limit, status=status_filter)


@router.get("/{id}", response_model=schemas.OpportunityResponse, status_code=status.HTTP_200_OK)
def read_opportunity(id: int, db: Session = Depends(get_db)):
    """Retrieve a single research opportunity by ID."""
    db_opportunity = crud.get_opportunity(db, opportunity_id=id)
    if not db_opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research opportunity with id {id} not found."
        )
    return db_opportunity


@router.post("", response_model=schemas.OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_new_opportunity(
    opportunity: schemas.OpportunityCreate,
    db: Session = Depends(get_db)
):
    """Create a new research opportunity."""
    return crud.create_opportunity(db, opportunity=opportunity)


@router.put("/{id}", response_model=schemas.OpportunityResponse, status_code=status.HTTP_200_OK)
def update_existing_opportunity(
    id: int,
    opportunity_update: schemas.OpportunityUpdate,
    db: Session = Depends(get_db)
):
    """Update all fields of an existing research opportunity."""
    db_opportunity = crud.get_opportunity(db, opportunity_id=id)
    if not db_opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research opportunity with id {id} not found."
        )
    return crud.update_opportunity(db, db_opportunity=db_opportunity, opportunity_update=opportunity_update)


@router.delete("/{id}", response_model=schemas.MessageResponse, status_code=status.HTTP_200_OK)
def delete_existing_opportunity(id: int, db: Session = Depends(get_db)):
    """Delete an existing research opportunity by ID."""
    db_opportunity = crud.get_opportunity(db, opportunity_id=id)
    if not db_opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research opportunity with id {id} not found."
        )
    crud.delete_opportunity(db, db_opportunity=db_opportunity)
    return {"message": "Opportunity deleted successfully."}
