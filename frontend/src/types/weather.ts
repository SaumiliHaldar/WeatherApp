export interface WeatherData {
  location: { lat: number; lon: number };
  timezone: string;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
    visibility: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    uv_index: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  air_quality: {
    pm10: number;
    pm2_5: number;
    us_aqi: number;
  };
}
