export const API_BASE = 'http://localhost:8000';

export interface WeatherLocation {
  lat: number;
  lon: number;
  name?: string;
}

export const fetchWeather = async (lat: number, lon: number) => {
  const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
};

export const searchLocation = async (query: string) => {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search location');
  return res.json();
};

export const reverseGeocode = async (lat: number, lon: number) => {
  const res = await fetch(`${API_BASE}/reverse?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to reverse geocode');
  return res.json();
};
