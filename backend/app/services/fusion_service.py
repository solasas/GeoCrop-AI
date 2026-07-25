import logging
import pandas as pd
from shapely.geometry import shape
from typing import Dict, Any, List
from app.services.gee_service import fetch_sentinel_indices
from app.services.weather_service import fetch_daily_weather

logger = logging.getLogger(__name__)

def fuse_satellite_and_weather(
    polygon_geometry: Dict[str, Any],
    start_date: str,
    end_date: str,
    force_mock: bool = False
) -> Dict[str, Any]:
    """
    Fuses Sentinel-2 Satellite Vegetation Indices (NDVI, NDWI)
    with Open-Meteo Weather metrics (Tmax, Tmin, Precip, GDD) across time steps.
    Returns structured Pandas DataFrame export and analytics JSON payload.
    """
    # Compute centroid latitude and longitude
    shapely_geom = shape(polygon_geometry)
    centroid = shapely_geom.centroid
    lat, lon = centroid.y, centroid.x

    # Fetch 10-day Sentinel satellite indices
    satellite_series = fetch_sentinel_indices(polygon_geometry, start_date, end_date, interval_days=10, force_mock=force_mock)
    
    # Fetch daily weather & GDD data
    weather_series = fetch_daily_weather(lat, lon, start_date, end_date, force_mock=force_mock)

    # Convert to Pandas DataFrames for temporal alignment & fusion
    df_sat = pd.DataFrame(satellite_series)
    df_weather = pd.DataFrame(weather_series)

    if df_sat.empty or df_weather.empty:
        raise ValueError("Failed to retrieve satellite or weather data series")

    # Merge satellite indices onto daily weather dataset using outer date join & forward fill
    df_merged = pd.merge(df_weather, df_sat, on="date", how="left")
    df_merged["ndvi"] = df_merged["ndvi"].ffill().bfill()
    df_merged["ndwi"] = df_merged["ndwi"].ffill().bfill()

    # Extract summary indicators
    peak_ndvi = float(df_merged["ndvi"].max())
    latest_ndvi = float(df_merged["ndvi"].iloc[-1])
    latest_ndwi = float(df_merged["ndwi"].iloc[-1])
    total_gdd = float(df_merged["accumulated_gdd"].iloc[-1])
    total_precip = float(df_merged["accumulated_precip_mm"].iloc[-1])

    # Format fused time series output list
    fused_timeline = df_merged.to_dict(orient="records")

    return {
        "metadata": {
            "centroid": {"latitude": round(lat, 5), "longitude": round(lon, 5)},
            "start_date": start_date,
            "end_date": end_date,
            "total_days": len(df_merged),
            "summary": {
                "peak_ndvi": round(peak_ndvi, 4),
                "latest_ndvi": round(latest_ndvi, 4),
                "latest_ndwi": round(latest_ndwi, 4),
                "accumulated_gdd": round(total_gdd, 1),
                "accumulated_precip_mm": round(total_precip, 1)
            }
        },
        "time_series": fused_timeline
    }
