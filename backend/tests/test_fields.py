import pytest
import os
os.environ["TESTING"] = "True"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_VALID_POLYGON = {
    "type": "Polygon",
    "coordinates": [[
        [-102.50, 38.50],
        [-102.50, 38.60],
        [-102.40, 38.60],
        [-102.40, 38.50],
        [-102.50, 38.50]
    ]]
}

SAMPLE_INVALID_GEOMETRY = {
    "type": "Point",
    "coordinates": [-102.50, 38.50]
}

def test_create_field_success():
    payload = {
        "name": "Pivot Corn Field Alpha",
        "crop_type": "Corn",
        "planting_date": "2026-04-15",
        "expected_harvest": "2026-10-01",
        "geometry": SAMPLE_VALID_POLYGON
    }

    response = client.post("/api/v1/fields", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Pivot Corn Field Alpha"
    assert data["crop_type"] == "Corn"
    assert data["area_hectares"] > 0
    assert data["geometry"]["type"] == "Polygon"

def test_create_field_invalid_geometry():
    payload = {
        "name": "Invalid Field",
        "crop_type": "Wheat",
        "planting_date": "2026-03-01",
        "expected_harvest": "2026-07-01",
        "geometry": SAMPLE_INVALID_GEOMETRY
    }

    response = client.post("/api/v1/fields", json=payload)
    assert response.status_code == 400
    assert "Invalid geometry" in response.json()["detail"]

def test_list_fields_json_and_geojson():
    # Fetch standard list
    response = client.get("/api/v1/fields")
    assert response.status_code == 200
    fields_list = response.json()
    assert isinstance(fields_list, list)

    # Fetch GeoJSON format
    response_geojson = client.get("/api/v1/fields?format=geojson")
    assert response_geojson.status_code == 200
    geojson_data = response_geojson.json()
    assert geojson_data["type"] == "FeatureCollection"
    assert len(geojson_data["features"]) > 0

def test_get_and_delete_field():
    # Create field first
    payload = {
        "name": "Soybean Sector B",
        "crop_type": "Soybeans",
        "planting_date": "2026-05-10",
        "expected_harvest": "2026-10-20",
        "geometry": SAMPLE_VALID_POLYGON
    }
    create_res = client.post("/api/v1/fields", json=payload)
    field_id = create_res.json()["id"]

    # Get single field
    get_res = client.get(f"/api/v1/fields/{field_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Soybean Sector B"

    # Delete field
    del_res = client.delete(f"/api/v1/fields/{field_id}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == field_id

    # Verify field is deleted
    get_res_404 = client.get(f"/api/v1/fields/{field_id}")
    assert get_res_404.status_code == 404
