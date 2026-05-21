import { create } from 'zustand';
import { fetchWeather, reverseGeocode } from '../api/weather';
import type { WeatherLocation } from '../api/weather';
import type { WeatherData } from '../types/weather';

interface WeatherState {
  location: WeatherLocation;
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (loc: WeatherLocation) => void;
  loadWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  location: { lat: 40.7128, lon: -74.0060, name: 'New York, USA' }, // Default
  weatherData: null,
  isLoading: false,
  error: null,
  
  setLocation: (loc) => {
    set({ location: loc });
    get().loadWeather();
  },
  
  loadWeather: async () => {
    set({ isLoading: true, error: null });
    try {
      const { location } = get();
      
      // Fetch weather
      const data = await fetchWeather(location.lat, location.lon);
      
      // If name is missing, reverse geocode it
      let name = location.name;
      if (!name) {
        const geo = await reverseGeocode(location.lat, location.lon);
        name = `${geo.name}, ${geo.country_code}`;
        set({ location: { ...location, name } });
      }
      
      set({ weatherData: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
