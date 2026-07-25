from shapely.geometry import shape, Polygon, MultiPolygon
from shapely import validation
import pyproj
from typing import Dict, Any, Tuple

def validate_and_process_geometry(raw_geometry: Dict[str, Any]) -> Tuple[Dict[str, Any], float]:
    """
    Validates a GeoJSON geometry using Shapely.
    Normalizes GeoJSON structure (extracting geometry from Feature if passed).
    Calculates geodesic area in hectares using PyProj.
    """
    if not isinstance(raw_geometry, dict):
        raise ValueError("Geometry must be a valid GeoJSON object")

    # If raw_geometry is a GeoJSON Feature, extract geometry attribute
    if raw_geometry.get("type") == "Feature" and "geometry" in raw_geometry:
        geom_dict = raw_geometry["geometry"]
    else:
        geom_dict = raw_geometry

    if not geom_dict or "type" not in geom_dict or "coordinates" not in geom_dict:
        raise ValueError("Invalid GeoJSON format: missing 'type' or 'coordinates'")

    if geom_dict["type"] not in ["Polygon", "MultiPolygon"]:
        raise ValueError(f"Unsupported geometry type '{geom_dict['type']}'. Only 'Polygon' or 'MultiPolygon' are supported.")

    try:
        shapely_geom = shape(geom_dict)
    except Exception as e:
        raise ValueError(f"Failed to parse Shapely geometry: {str(e)}")

    if not shapely_geom.is_valid:
        # Attempt repair using make_valid if available
        try:
            shapely_geom = validation.make_valid(shapely_geom)
        except Exception:
            raise ValueError("Geometry is invalid (e.g. self-intersecting polygon) and could not be repaired.")

    if shapely_geom.is_empty:
        raise ValueError("Geometry is empty")

    # Geodesic area calculation on WGS84 ellipsoid (EPSG:4326)
    geod = pyproj.Geod(ellps="WGS84")
    area_sq_meters, _ = geod.geometry_area_perimeter(shapely_geom)
    area_sq_meters = abs(area_sq_meters)
    
    # Convert square meters to hectares (1 ha = 10,000 sq meters)
    area_hectares = round(area_sq_meters / 10000.0, 2)

    return geom_dict, area_hectares
