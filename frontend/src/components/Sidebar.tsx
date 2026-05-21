import React from 'react';
import { Plus, Navigation, Sunrise, Sunset, ChevronLeft, ChevronRight, Sun, Cloud, CloudRain } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';

export const Sidebar: React.FC = () => {
  const { location, weatherData, isLoading } = useWeatherStore();

  const temp = weatherData ? Math.round(weatherData.current.temperature_2m) : '--';
  const weatherCode = weatherData ? weatherData.current.weather_code : 0;
  
  let conditionText = 'Loading...';
  let ConditionIcon = Sun;
  
  if (weatherData) {
    if (weatherCode > 50) { conditionText = 'Rainy'; ConditionIcon = CloudRain; }
    else if (weatherCode > 0) { conditionText = 'Cloudy'; ConditionIcon = Cloud; }
    else { conditionText = 'Sunny'; ConditionIcon = Sun; }
  }

  const isCelsius = true; // Hardcoded toggle for now

  // Cityscape SVG at the bottom
  const Cityscape = () => (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 opacity-80 mix-blend-overlay">
      <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto translate-y-2">
        {/* Sun */}
        <circle cx="80" cy="100" r="50" fill="#FBBF24" opacity="0.9"/>
        {/* Buildings background */}
        <rect x="0" y="120" width="30" height="80" fill="#94A3B8" />
        <rect x="32" y="90" width="45" height="110" fill="#CBD5E1" />
        {/* Main tall building */}
        <path d="M100 150 L100 40 L110 40 L110 20 L115 10 L120 20 L120 40 L130 40 L130 150 Z" fill="#64748B" />
        <rect x="132" y="130" width="40" height="70" fill="#94A3B8" />
        <rect x="175" y="100" width="50" height="100" fill="#CBD5E1" />
        <rect x="230" y="140" width="40" height="60" fill="#94A3B8" />
        <rect x="275" y="110" width="25" height="90" fill="#CBD5E1" />
        {/* Details on main building */}
        <line x1="110" y1="50" x2="110" y2="150" stroke="#475569" strokeWidth="2" />
        <line x1="120" y1="50" x2="120" y2="150" stroke="#475569" strokeWidth="2" />
      </svg>
    </div>
  );

  return (
    <div className="relative w-[300px] shrink-0 bg-gradient-to-b from-[#5c9ce6] to-[#4b85d0] text-white flex flex-col justify-between overflow-hidden">
      {/* Content wrapper to stay above SVG */}
      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <button className="bg-white text-blue-500 p-2 rounded-xl shadow-sm hover:scale-105 transition-transform">
            <Plus size={20} strokeWidth={3} />
          </button>
          
          <div className="flex gap-1.5">
            <div className="w-5 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium">
            <span className={isCelsius ? "text-white" : "text-white/50"}>°C</span>
            <div className="w-8 h-4 bg-white/30 rounded-full relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-all"></div>
            </div>
            <span className={!isCelsius ? "text-white" : "text-white/50"}>°F</span>
          </div>
        </div>

        {/* Location & Time */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-white/80" />
            <span className="font-medium truncate max-w-[120px]">{location.name}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1">
              <Sunrise size={14} className="text-white/80" />
              <span>{weatherData ? new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '07:19'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset size={14} className="text-white/80" />
              <span>{weatherData ? new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '19:32'}</span>
            </div>
          </div>
        </div>
        
        {/* Date */}
        <div className="text-sm text-white/80 mb-12">
          Today {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </div>

        {/* Temperature & Condition */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center justify-between w-full">
            <ChevronLeft size={24} className="text-white/50 hover:text-white cursor-pointer" />
            <div className="text-[6rem] leading-none font-light tracking-tighter">
              {isLoading ? '--' : temp}°
            </div>
            <ChevronRight size={24} className="text-white/50 hover:text-white cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 mt-4 text-xl font-medium">
            <ConditionIcon size={24} className={weatherCode > 50 ? "text-blue-300" : weatherCode > 0 ? "text-slate-200" : "text-yellow-300"} fill="currentColor" />
            <span>{conditionText}</span>
          </div>
        </div>
      </div>

      <Cityscape />
    </div>
  );
};
