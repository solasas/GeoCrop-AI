import pytest
import os
os.environ["TESTING"] = "True"

from fastapi.testclient import TestClient
from app.main import app
from app.services.gee_service import fetch_sentinel_indices
from app.services.weather_service import fetch_daily_weather
from app.services.fusion_service import fuse_satellite_and_weather

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

def test_gee_service_mock_indices():
    indices = fetch_sentinel_indices(
        polygon_geometry=SAMPLE_POLYGON,
        start_date="2026-04-01",
        end_date="2026-06-01",
        interval_days=10,
        force_mock=True
    )
    assert len(indices) > 0
    first_item = indices[0]
    assert "date" in first_item
    assert "ndvi" in first_item
    assert "ndwi" in first_item
    assert 0.0 <= first_item["ndvi"] <= 1.0

def test_weather_service_gdd_calculation():
    weather_data = fetch_daily_weather(
        latitude=38.55,
        longitude=-102.45,
        start_date="2026-04-01",
        end_date="2026-04-10",
        base_temp_c=10.0,
        force_mock=True
    )
    assert len(weather_data) == 10
    day1 = weather_data[0]
    assert "tmax" in day1
    assert "tmin" in day1
    assert "gdd_daily" in day1
    assert "accumulated_gdd" in day1
    assert day1["accumulated_gdd"] >= day1["gdd_daily"]

def test_fusion_service_data_merging():
    fusion_result = fuse_satellite_and_weather(
        polygon_geometry=SAMPLE_POLYGON,
        start_date="2026-04-01",
        end_date="2026-05-01",
        force_mock=True
    )
    assert "metadata" in fusion_result
    assert "time_series" in fusion_result
    summary = fusion_result["metadata"]["summary"]
    assert "peak_ndvi" in summary
    assert "accumulated_gdd" in summary
    assert len(fusion_result["time_series"]) > 0

def test_analytics_endpoint():
    # 1. Ingest test field
    field_payload = {
        "name": "Fusion Test Field",
        "crop_type": "Corn",
        "planting_date": "2026-04-01",
        "expected_harvest": "2026-09-01",
        "geometry": SAMPLE_POLYGON
    }
    create_res = client.post("/api/v1/fields", json=field_payload)
    assert create_res.status_code == 201
    field_id = create_res.json()["id"]

    # 2. Query analytics endpoint
    res = client.get(f"/api/v1/fields/{field_id}/analytics?force_mock=true")
    assert res.status_code == 200
    data = res.json()
    assert data["field_info"]["id"] == field_id
    assert "metadata" in data
    assert "time_series" in data
    assert len(data["time_series"]) > 0
