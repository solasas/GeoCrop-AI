from pydantic import BaseModel, Field as PydanticField, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime

class GeometrySchema(BaseModel):
    type: str = PydanticField(..., examples=["Polygon"])
    coordinates: List[Any] = PydanticField(..., examples=[[[-102.5, 38.5], [-102.5, 38.6], [-102.4, 38.6], [-102.4, 38.5], [-102.5, 38.5]]])

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ["Polygon", "MultiPolygon"]:
            raise ValueError("Geometry type must be 'Polygon' or 'MultiPolygon'")
        return v

class FieldCreate(BaseModel):
    name: str = PydanticField(..., min_length=2, max_length=150, examples=["North Corn Field A1"])
    crop_type: str = PydanticField(..., min_length=2, max_length=100, examples=["Corn"])
    planting_date: str = PydanticField(..., examples=["2026-04-15"])
    expected_harvest: str = PydanticField(..., examples=["2026-10-01"])
    geometry: Dict[str, Any] = PydanticField(..., description="GeoJSON geometry object or Feature object containing Polygon geometry")


class FieldResponse(BaseModel):
    id: int
    name: str
    crop_type: str
    planting_date: str
    expected_harvest: str
    area_hectares: float
    geometry: Dict[str, Any]
    created_at: Optional[str] = None

class FieldGeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: int
    properties: Dict[str, Any]
    geometry: Dict[str, Any]

class FieldGeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[FieldGeoJSONFeature]
