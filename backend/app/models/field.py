from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from app.core.database import Base

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    crop_type = Column(String(100), nullable=False, index=True)
    planting_date = Column(String(50), nullable=False)
    expected_harvest = Column(String(50), nullable=False)
    area_hectares = Column(Float, nullable=False, default=0.0)
    
    # GeoJSON geometry storage (compatible with PostGIS & SQLite)
    geometry = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "crop_type": self.crop_type,
            "planting_date": self.planting_date,
            "expected_harvest": self.expected_harvest,
            "area_hectares": round(self.area_hectares, 2),
            "geometry": self.geometry,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def to_geojson_feature(self):
        return {
            "type": "Feature",
            "id": self.id,
            "properties": {
                "id": self.id,
                "name": self.name,
                "crop_type": self.crop_type,
                "planting_date": self.planting_date,
                "expected_harvest": self.expected_harvest,
                "area_hectares": round(self.area_hectares, 2),
                "created_at": self.created_at.isoformat() if self.created_at else None
            },
            "geometry": self.geometry
        }
