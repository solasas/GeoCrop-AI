from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Union, Dict, Any
from app.core.database import get_db, engine, Base
from app.models.field import Field
from app.schemas.field import FieldCreate, FieldResponse, FieldGeoJSONFeatureCollection
from app.services.spatial_service import validate_and_process_geometry

# Ensure tables are created
Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.post("", response_model=FieldResponse, status_code=status.HTTP_201_CREATED, summary="Create/Ingest Field Boundary")
@router.post("/", response_model=FieldResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_field(payload: FieldCreate, db: Session = Depends(get_db)):
    """
    Ingests field boundary polygon, validates spatial geometry with Shapely,
    calculates area in hectares, and persists field to database.
    """
    try:
        clean_geom, area_ha = validate_and_process_geometry(payload.geometry)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid geometry: {str(ve)}"
        )

    db_field = Field(
        name=payload.name,
        crop_type=payload.crop_type,
        planting_date=payload.planting_date,
        expected_harvest=payload.expected_harvest,
        area_hectares=area_ha,
        geometry=clean_geom
    )

    db.add(db_field)
    db.commit()
    db.refresh(db_field)

    return db_field.to_dict()

@router.get("", response_model=Union[List[FieldResponse], Dict[str, Any]], summary="List Saved Field Boundaries")
@router.get("/", response_model=Union[List[FieldResponse], Dict[str, Any]], include_in_schema=False)
async def list_fields(
    format: Optional[str] = Query(None, description="Set format=geojson to return a GeoJSON FeatureCollection"),
    db: Session = Depends(get_db)
):
    """
    Retrieves all field records stored in the PostGIS/Database.
    Supports returning standard JSON list or GeoJSON FeatureCollection for direct Mapbox GL JS map rendering.
    """
    fields = db.query(Field).order_by(Field.id.desc()).all()

    if format and format.lower() == "geojson":
        return {
            "type": "FeatureCollection",
            "features": [f.to_geojson_feature() for f in fields]
        }
    
    return [f.to_dict() for f in fields]

@router.get("/{field_id}", response_model=FieldResponse, summary="Get Single Field")
async def get_field(field_id: int, db: Session = Depends(get_db)):
    db_field = db.query(Field).filter(Field.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Field with ID {field_id} not found")
    return db_field.to_dict()

@router.delete("/{field_id}", status_code=status.HTTP_200_OK, summary="Delete Field")
async def delete_field(field_id: int, db: Session = Depends(get_db)):
    db_field = db.query(Field).filter(Field.id == field_id).first()
    if not db_field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Field with ID {field_id} not found")
    
    db.delete(db_field)
    db.commit()
    return {"message": f"Field {field_id} deleted successfully", "id": field_id}
