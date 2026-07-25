import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from shapely.geometry import shape

logger = logging.getLogger(__name__)

# Check Earth Engine SDK availability and authentication status
GEE_AVAILABLE = False
try:
    import ee
    GEE_AVAILABLE = True
except ImportError:
    ee = None

GEE_INITIALIZED = False

def initialize_gee() -> bool:
    global GEE_INITIALIZED
    if not GEE_AVAILABLE or ee is None:
        return False
    
    if GEE_INITIALIZED:
        return True

    try:
        # Attempt initialization with environment credentials
        ee.Initialize(opt_url='https://earthengine.googleapis.com')
        GEE_INITIALIZED = True
        logger.info("Google Earth Engine API initialized successfully.")
        return True
    except Exception as e:
        logger.warning(f"Google Earth Engine init failed: {e}. Switching to mock data provider.")
        GEE_INITIALIZED = False
        return False

def mask_s2_clouds(image):
    """Masks clouds in Sentinel-2 Surface Reflectance using QA60 band."""
    if ee is None:
        return image
    qa = image.select('QA60')
    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11
    mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))
    return image.updateMask(mask).divide(10000)

def fetch_sentinel_indices(
    polygon_geometry: Dict[str, Any],
    start_date: str,
    end_date: str,
    interval_days: int = 10,
    force_mock: bool = False
) -> List[Dict[str, Any]]:
    """
    Fetches 10-day aggregated NDVI and NDWI values for a field polygon.
    Uses Google Earth Engine when authenticated, or returns synthetic growth curve data.
    """
    is_gee_ready = initialize_gee() and not force_mock

    if is_gee_ready:
        try:
            return _fetch_gee_sentinel_series(polygon_geometry, start_date, end_date, interval_days)
        except Exception as e:
            logger.error(f"GEE execution failed: {e}. Falling back to mock generator.")
            return _generate_mock_sentinel_series(start_date, end_date, interval_days)
    else:
        return _generate_mock_sentinel_series(start_date, end_date, interval_days)

def _fetch_gee_sentinel_series(
    polygon_geometry: Dict[str, Any],
    start_date: str,
    end_date: str,
    interval_days: int
) -> List[Dict[str, Any]]:
    """Real GEE Sentinel-2 image reduction."""
    coords = polygon_geometry.get("coordinates", [])
    ee_polygon = ee.Geometry.Polygon(coords)

    # Filter Sentinel-2 HARMONIZED collection
    collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(ee_polygon)
        .filterDate(start_date, end_date)
        .map(mask_s2_clouds)
    )

    # Add NDVI and NDWI bands
    def add_indices(img):
        ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
        ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI')
        return img.addBands([ndvi, ndwi])

    indexed_col = collection.map(add_indices)

    # Date step loop
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    results = []

    curr_dt = start_dt
    while curr_dt <= end_dt:
        next_dt = curr_dt + timedelta(days=interval_days)
        step_start = curr_dt.strftime("%Y-%m-%d")
        step_end = next_dt.strftime("%Y-%m-%d")

        sub_col = indexed_col.filterDate(step_start, step_end)
        mean_img = sub_col.select(['NDVI', 'NDWI']).mean()

        stats = mean_img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=ee_polygon,
            scale=10,
            maxPixels=1e9
        ).getInfo()

        ndvi_val = stats.get('NDVI') if stats and stats.get('NDVI') is not None else 0.15
        ndwi_val = stats.get('NDWI') if stats and stats.get('NDWI') is not None else -0.10

        results.append({
            "date": step_start,
            "ndvi": round(float(ndvi_val), 4),
            "ndwi": round(float(ndwi_val), 4)
        })

        curr_dt = next_dt

    return results

def _generate_mock_sentinel_series(
    start_date: str,
    end_date: str,
    interval_days: int
) -> List[Dict[str, Any]]:
    """
    Generates agronomic temporal curve for crop vegetation indices:
    NDVI starts low (~0.15), peaks at mid-season (~0.82), and declines at senescence (~0.25).
    """
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    total_days = max(1, (end_dt - start_dt).days)

    results = []
    curr_dt = start_dt
    import math

    while curr_dt <= end_dt:
        elapsed = (curr_dt - start_dt).days
        progress = elapsed / total_days  # 0.0 to 1.0

        # Sine-based agronomic canopy growth model
        peak_progress = 0.55  # Peak vegetation at 55% into season
        growth_factor = math.sin(math.pi * min(1.0, max(0.0, progress / peak_progress if progress < peak_progress else (1.0 - progress) / (1.0 - peak_progress))))

        ndvi = round(0.18 + 0.65 * max(0, growth_factor) + (0.02 * math.sin(elapsed)), 4)
        ndwi = round(-0.15 + 0.35 * max(0, growth_factor) - (0.01 * math.cos(elapsed)), 4)

        results.append({
            "date": curr_dt.strftime("%Y-%m-%d"),
            "ndvi": max(0.05, min(0.95, ndvi)),
            "ndwi": max(-0.5, min(0.5, ndwi))
        })

        curr_dt += timedelta(days=interval_days)

    return results
