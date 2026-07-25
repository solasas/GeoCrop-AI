from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.models.field import Field
from app.services.fusion_service import fuse_satellite_and_weather

router = APIRouter()

@router.get("/{field_id}/analytics", summary="Get Satellite & Weather Fused Analytics")
async def get_field_analytics(
    field_id: int,
    force_mock: bool = Query(False, description="Force mock data generation for testing"),
    db: Session = Depends(get_db)
):
    """
    Fetches fused Sentinel-2 satellite indices (NDVI, NDWI) and Open-Meteo weather metrics (Tmax, Tmin, Precip, GDD)
    from planting date to current harvest timeline for a given field boundary.
    """
    db_field = db.query(Field).filter(Field.id == field_id).first()
    if not db_field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field boundary with ID {field_id} not found"
        )

    start_date = db_field.planting_date
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    end_date = min(today_str, db_field.expected_harvest)

    # Ensure valid date order
    if start_date >= end_date:
        end_date = (datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=90)).strftime("%Y-%m-%d")

    try:
        fusion_data = fuse_satellite_and_weather(
            polygon_geometry=db_field.geometry,
            start_date=start_date,
            end_date=end_date,
            force_mock=force_mock
        )
        fusion_data["field_info"] = db_field.to_dict()
        return fusion_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data fusion processing failed: {str(e)}"
        )

@router.get("/{field_id}/satellite", summary="Get Sentinel-2 Indices Time-Series")
async def get_field_satellite(
    field_id: int,
    force_mock: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Returns standalone Sentinel-2 satellite vegetation index series."""
    analytics = await get_field_analytics(field_id=field_id, force_mock=force_mock, db=db)
    return {
        "field_id": field_id,
        "summary": analytics["metadata"]["summary"],
        "time_series": [
            {
                "date": item["date"],
                "ndvi": item["ndvi"],
                "ndwi": item["ndwi"]
            }
            for item in analytics["time_series"]
        ]
    }
