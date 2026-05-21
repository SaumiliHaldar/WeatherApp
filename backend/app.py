from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
from cachetools import TTLCache

# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────
app = FastAPI(title="WeatherApp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Cache  (TTL = 10 min)
# ──────────────────────────────────────────────
weather_cache: TTLCache = TTLCache(maxsize=256, ttl=600)
search_cache:  TTLCache = TTLCache(maxsize=256, ttl=3600)
reverse_cache: TTLCache = TTLCache(maxsize=256, ttl=3600)

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────
OPEN_METEO_FORECAST   = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_GEOCODING  = "https://geocoding-api.open-meteo.com/v1/search"
OPEN_METEO_AQI        = "https://air-quality-api.open-meteo.com/v1/air-quality"
NOMINATIM_REVERSE     = "https://nominatim.openstreetmap.org/reverse"

NOMINATIM_HEADERS = {"User-Agent": "WeatherApp/1.0 (contact@weatherapp.dev)"}

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/weather")
async def get_weather(
    lat: float = Query(..., description="Latitude (WGS84)"),
    lon: float = Query(..., description="Longitude (WGS84)"),
    units: str  = Query("celsius", description="Temperature unit: celsius | fahrenheit"),
):
    cache_key = (round(lat, 4), round(lon, 4), units)
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    wind_unit = "kmh"
    temp_unit = units if units in ("celsius", "fahrenheit") else "celsius"

    forecast_params = {
        "latitude":  lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m", "relative_humidity_2m", "apparent_temperature",
            "is_day", "precipitation", "rain", "showers", "snowfall",
            "weather_code", "cloud_cover", "pressure_msl", "surface_pressure",
            "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "visibility",
        ]),
        "hourly": ",".join([
            "temperature_2m", "relative_humidity_2m", "apparent_temperature",
            "precipitation_probability", "precipitation", "weather_code",
            "cloud_cover", "wind_speed_10m", "wind_direction_10m",
            "uv_index", "visibility", "dew_point_2m", "surface_pressure",
            "is_day",
        ]),
        "daily": ",".join([
            "weather_code", "temperature_2m_max", "temperature_2m_min",
            "apparent_temperature_max", "apparent_temperature_min",
            "sunrise", "sunset",
            "uv_index_max", "precipitation_sum", "precipitation_probability_max",
            "wind_speed_10m_max", "wind_direction_10m_dominant",
        ]),
        "temperature_unit":    temp_unit,
        "wind_speed_unit":     wind_unit,
        "precipitation_unit":  "mm",
        "timezone":            "auto",
        "forecast_days":       15,
        "past_days":           1,
    }

    aqi_params = {
        "latitude":  lat,
        "longitude": lon,
        "current": ",".join([
            "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide",
            "sulphur_dioxide", "ozone", "european_aqi", "us_aqi",
            "uv_index", "uv_index_clear_sky", "dust", "aerosol_optical_depth",
        ]),
        "hourly": "pm2_5,pm10,european_aqi,us_aqi",
        "timezone": "auto",
        "forecast_days": 2,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            forecast_req = client.get(OPEN_METEO_FORECAST, params=forecast_params)
            aqi_req      = client.get(OPEN_METEO_AQI,      params=aqi_params)
            forecast_resp, aqi_resp = await asyncio.gather(forecast_req, aqi_req, return_exceptions=True)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream fetch error: {e}")

    if isinstance(forecast_resp, Exception) or forecast_resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data")

    forecast = forecast_resp.json()
    aqi      = {} if isinstance(aqi_resp, Exception) or aqi_resp.status_code != 200 else aqi_resp.json()

    result = {
        "location": {"lat": lat, "lon": lon},
        "timezone":              forecast.get("timezone", "UTC"),
        "timezone_abbreviation": forecast.get("timezone_abbreviation", "UTC"),
        "utc_offset_seconds":    forecast.get("utc_offset_seconds", 0),
        "current":               forecast.get("current", {}),
        "current_units":         forecast.get("current_units", {}),
        "hourly":                forecast.get("hourly", {}),
        "hourly_units":          forecast.get("hourly_units", {}),
        "daily":                 forecast.get("daily", {}),
        "daily_units":           forecast.get("daily_units", {}),
        "air_quality":           aqi.get("current", {}),
        "air_quality_hourly":    aqi.get("hourly", {}),
    }

    weather_cache[cache_key] = result
    return result


@app.get("/search")
async def search_location(q: str = Query(..., min_length=1)):
    cache_key = q.strip().lower()
    if cache_key in search_cache:
        return search_cache[cache_key]

    params = {
        "name":     q,
        "count":    8,
        "language": "en",
        "format":   "json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPEN_METEO_GEOCODING, params=params)
        data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Geocoding error: {e}")

    results = [
        {
            "id":           r.get("id"),
            "name":         r.get("name"),
            "country":      r.get("country"),
            "country_code": r.get("country_code", "").upper(),
            "admin1":       r.get("admin1", ""),
            "admin2":       r.get("admin2", ""),
            "lat":          r.get("latitude"),
            "lon":          r.get("longitude"),
            "timezone":     r.get("timezone"),
            "population":   r.get("population", 0),
            "elevation":    r.get("elevation", 0),
        }
        for r in data.get("results", [])
    ]

    search_cache[cache_key] = results
    return results


@app.get("/reverse")
async def reverse_geocode(
    lat: float = Query(...),
    lon: float = Query(...),
):
    cache_key = (round(lat, 3), round(lon, 3))
    if cache_key in reverse_cache:
        return reverse_cache[cache_key]

    params = {
        "lat":            lat,
        "lon":            lon,
        "format":         "json",
        "zoom":           10,
        "addressdetails": 1,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(NOMINATIM_REVERSE, params=params, headers=NOMINATIM_HEADERS)
        data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Reverse geocoding error: {e}")

    address = data.get("address", {})
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("county")
        or data.get("name", "Unknown")
    )

    result = {
        "name":         city,
        "country":      address.get("country", ""),
        "country_code": address.get("country_code", "").upper(),
        "state":        address.get("state", ""),
        "display_name": data.get("display_name", ""),
    }

    reverse_cache[cache_key] = result
    return result
