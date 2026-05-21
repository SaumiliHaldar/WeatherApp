import React, { useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { UpcomingHours } from './UpcomingHours';
import { MoreDetails } from './MoreDetails';
import { useWeatherStore } from '../store/useWeatherStore';

export const Dashboard: React.FC = () => {
  const { loadWeather, weatherData, isLoading, error } = useWeatherStore();

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return (
    <div className="flex-1 bg-[#F3F7FD] p-10 flex flex-col gap-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-1">Welcome back Isabella!</h2>
          <p className="text-slate-600 font-medium">Check out today's weather information</p>
        </div>
        <div className="flex items-center gap-4">
          <MoreHorizontal className="text-slate-400 cursor-pointer hover:text-slate-600" />
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center">
            <img 
              src="https://unavatar.io/x/isabella" 
              alt="Avatar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if unavatar fails
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Isabella&background=0D8ABC&color=fff';
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      {isLoading && !weatherData && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading actual weather data from app.py...</p>
        </div>
      )}

      {error && !weatherData && (
        <div className="flex-1 flex items-center justify-center text-red-500 font-medium">
          Error loading data: {error}. Is the backend running?
        </div>
      )}

      {weatherData && (
        <>
          <UpcomingHours />
          <MoreDetails />
        </>
      )}
    </div>
  );
};
