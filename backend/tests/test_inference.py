import pytest
import os
os.environ["TESTING"] = "True"

from fastapi.testclient import TestClient
from app.main import app
from app.services.inference_service import (
    get_or_train_yield_model,
    extract_agronomic_features,
    predict_crop_yield
)

client = TestClient(app)

SAMPLE_POLYGON = {
    "type": "Polygon",
    "coordinates": [[
        [-102.50, 38.50],
        [-102.50, 38.60],
        [-102.40, 38.60],
        [-102.40, 38.50],
        [-102.50, 38.50]
    ]]
}

def test_model_initialization():
    model = get_or_train_yield_model()
    assert model is not None

def test_predict_crop_yield():
    mock_fusion = {
        "metadata": {
            "summary": {
                "peak_ndvi": 0.82,
                "latest_ndvi": 0.75,
                "latest_ndwi": 0.12,
                "accumulated_gdd": 1450.0,
                "accumulated_precip_mm": 320.0
            }
        },
        "time_series": [
            {"date": "2026-04-01", "ndvi": 0.20, "ndwi": -0.10, "accumulated_gdd": 50.0, "accumulated_precip_mm": 10.0},
            {"date": "2026-05-01", "ndvi": 0.65, "ndwi": 0.05, "accumulated_gdd": 600.0, "accumulated_precip_mm": 120.0},
            {"date": "2026-06-01", "ndvi": 0.82, "ndwi": 0.12, "accumulated_gdd": 1450.0, "accumulated_precip_mm": 320.0}
        ]
    }

    result = predict_crop_yield(mock_fusion, crop_type="Corn", area_hectares=45.5)
    
    assert "predicted_yield_t_per_ha" in result
    assert result["predicted_yield_t_per_ha"] > 0
    assert "confidence_interval" in result
    assert result["confidence_interval"]["lower_bound"] < result["predicted_yield_t_per_ha"] < result["confidence_interval"]["upper_bound"]
    assert "shap_explanations" in result
    assert len(result["shap_explanations"]) > 0

def test_yield_prediction_endpoint():
    # 1. Ingest field
    field_payload = {
        "name": "Yield ML Field Test",
        "crop_type": "Corn",
        "planting_date": "2026-04-01",
        "expected_harvest": "2026-09-15",
        "geometry": SAMPLE_POLYGON
    }
    create_res = client.post("/api/v1/fields", json=field_payload)
    assert create_res.status_code == 201
    field_id = create_res.json()["id"]

    # 2. Call prediction endpoint
    res = client.get(f"/api/v1/fields/{field_id}/yield-prediction?force_mock=true")
    assert res.status_code == 200
    data = res.json()

    assert data["field_id"] == field_id
    assert data["crop_type"] == "Corn"
    assert "prediction" in data
    prediction = data["prediction"]
    assert prediction["predicted_yield_t_per_ha"] > 0
    assert "confidence_interval" in prediction
    assert len(prediction["shap_explanations"]) > 0
