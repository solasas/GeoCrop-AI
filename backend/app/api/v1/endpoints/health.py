from fastapi import APIRouter
import sys
import platform

router = APIRouter()

@router.get("/health", summary="Health Check")
async def health_check():
    """
    Base Health Check endpoint for GeoCrop AI Backend API.
    Returns operational status and loaded geospatial engine metrics.
    """
    geospatial_status = {}
    
    # Check GeoPandas / Shapely availability
    try:
        import geopandas as gpd
        import shapely
        geospatial_status["geopandas"] = f"available (v{gpd.__version__})"
        geospatial_status["shapely"] = f"available (v{shapely.__version__})"
    except ImportError as e:
        geospatial_status["geopandas"] = f"unavailable: {str(e)}"
    
    # Check Xarray availability
    try:
        import xarray as xr
        geospatial_status["xarray"] = f"available (v{xr.__version__})"
    except ImportError as e:
        geospatial_status["xarray"] = f"unavailable: {str(e)}"

    # Check GEE availability
    try:
        import ee
        geospatial_status["earthengine"] = f"available (v{ee.__version__})"
    except ImportError as e:
        geospatial_status["earthengine"] = f"unavailable: {str(e)}"

    return {
        "status": "online",
        "service": "GeoCrop AI API Gateway",
        "version": "1.0.0",
        "python_version": sys.version.split(" ")[0],
        "environment": {
            "os": platform.system(),
            "arch": platform.machine()
        },
        "geospatial_engines": geospatial_status
    }
