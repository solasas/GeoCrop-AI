import logging
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List
import math

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

def fetch_daily_weather(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    base_temp_c: float = 10.0,
    force_mock: bool = False
) -> List[Dict[str, Any]]:
    """
    Queries Open-Meteo API for daily weather data (Tmax, Tmin, Precip).
    Calculates daily Growing Degree Days (GDD) and accumulated metrics.
    Falls back to synthetic meteorological data when network is unavailable or force_mock=True.
    """
    if force_mock:
        return _generate_mock_weather(start_date, end_date, base_temp_c)

    try:
        # Determine whether to use archive API (past dates) or forecast API
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        api_url = OPEN_METEO_FORECAST_URL if start_date >= today_str else OPEN_METEO_URL

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
            "timezone": "auto"
        }

        with httpx.Client(timeout=5.0) as client:
            resp = client.get(api_url, params=params)

        if resp.status_code == 200:
            data = resp.json()
            return _process_open_meteo_response(data, base_temp_c)
        else:
            logger.warning(f"Open-Meteo status {resp.status_code}. Using weather fallback.")
            return _generate_mock_weather(start_date, end_date, base_temp_c)
    except Exception as e:
        logger.warning(f"Failed to fetch weather from Open-Meteo: {e}. Using weather fallback.")
        return _generate_mock_weather(start_date, end_date, base_temp_c)

def _process_open_meteo_response(data: Dict[str, Any], base_temp_c: float) -> List[Dict[str, Any]]:
    daily = data.get("daily", {})
    dates = daily.get("time", [])
    tmax_list = daily.get("temperature_2m_max", [])
    tmin_list = daily.get("temperature_2m_min", [])
    precip_list = daily.get("precipitation_sum", [])

    results = []
    accum_gdd = 0.0
    accum_precip = 0.0

    for i in range(len(dates)):
        tmax = tmax_list[i] if i < len(tmax_list) and tmax_list[i] is not None else 25.0
        tmin = tmin_list[i] if i < len(tmin_list) and tmin_list[i] is not None else 12.0
        precip = precip_list[i] if i < len(precip_list) and precip_list[i] is not None else 0.0

        t_avg = (tmax + tmin) / 2.0
        gdd = max(0.0, t_avg - base_temp_c)

        accum_gdd += gdd
        accum_precip += precip

        results.append({
            "date": dates[i],
            "tmax": round(tmax, 1),
            "tmin": round(tmin, 1),
            "precip_mm": round(precip, 1),
            "gdd_daily": round(gdd, 1),
            "accumulated_gdd": round(accum_gdd, 1),
            "accumulated_precip_mm": round(accum_precip, 1)
        })

    return results

def _generate_mock_weather(
    start_date: str,
    end_date: str,
    base_temp_c: float
) -> List[Dict[str, Any]]:
    """Synthetic seasonal daily weather curve."""
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")

    results = []
    accum_gdd = 0.0
    accum_precip = 0.0
    curr_dt = start_dt

    step = 0
    while curr_dt <= end_dt:
        # Seasonal temp cycle (e.g. spring to summer warming)
        base_tmax = 20.0 + 8.0 * math.sin(step * 0.05)
        base_tmin = 8.0 + 6.0 * math.sin(step * 0.05)

        tmax = round(base_tmax + (step % 5) - 2.0, 1)
        tmin = round(base_tmin + (step % 3) - 1.0, 1)
        
        # Occasional rainfall events
        precip = round(12.5 if (step % 7 == 3) else 0.0, 1)

        t_avg = (tmax + tmin) / 2.0
        gdd = max(0.0, t_avg - base_temp_c)

        accum_gdd += gdd
        accum_precip += precip

        results.append({
            "date": curr_dt.strftime("%Y-%m-%d"),
            "tmax": tmax,
            "tmin": tmin,
            "precip_mm": precip,
            "gdd_daily": round(gdd, 1),
            "accumulated_gdd": round(accum_gdd, 1),
            "accumulated_precip_mm": round(accum_precip, 1)
        })

        curr_dt += timedelta(days=1)
        step += 1

    return results
