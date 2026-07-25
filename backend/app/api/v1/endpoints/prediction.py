from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.field import Field
from app.services.fusion_service import fuse_satellite_and_weather
from app.services.inference_service import predict_crop_yield

router = APIRouter()

@router.get("/{field_id}/yield-prediction", summary="Get ML Crop Yield Prediction & SHAP Explanations")
async def get_field_yield_prediction(
    field_id: int,
    force_mock: bool = Query(False, description="Force mock data generation for testing"),
    db: Session = Depends(get_db)
):
    """
    Executes Spatial AI Crop Yield Prediction pipeline for a target field:
    1. Fetches field spatial boundary & metadata from database.
    2. Runs Sentinel-2 satellite & Open-Meteo weather data fusion pipeline.
    3. Extracts agronomic feature vector (Peak NDVI, GDD, Precip, Moisture).
    4. Performs XGBoost machine learning inference (t/ha).
    5. Computes 95% Confidence Interval & SHAP feature driver explanations.
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

    if start_date >= end_date:
        end_date = (datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=90)).strftime("%Y-%m-%d")

    try:
        # Step 1: Spatial & Meteorological Data Fusion
        fusion_payload = fuse_satellite_and_weather(
            polygon_geometry=db_field.geometry,
            start_date=start_date,
            end_date=end_date,
            force_mock=force_mock
        )

        # Step 2: Machine Learning Yield Inference & SHAP
        yield_results = predict_crop_yield(
            fusion_payload=fusion_payload,
            crop_type=db_field.crop_type,
            area_hectares=db_field.area_hectares
        )

        return {
            "field_id": db_field.id,
            "field_name": db_field.name,
            "crop_type": db_field.crop_type,
            "area_hectares": db_field.area_hectares,
            "planting_date": db_field.planting_date,
            "expected_harvest": db_field.expected_harvest,
            "prediction": yield_results,
            "fusion_metadata": fusion_payload["metadata"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Yield prediction pipeline execution failed: {str(e)}"
        )
