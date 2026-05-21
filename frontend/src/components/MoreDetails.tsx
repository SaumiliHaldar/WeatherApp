import React from 'react';
import { Droplets, Wind, CloudRain, Sun, Thermometer, CloudDrizzle } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';
import { cn } from '../utils/cn';

const CardHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex justify-between items-start mb-4">
    <h4 className="text-slate-800 font-medium">{title}</h4>
    <div className="bg-blue-500 text-white p-1.5 rounded-lg shadow-sm">
      <Icon size={16} />
    </div>
  </div>
);

export const MoreDetails: React.FC = () => {
  const { weatherData } = useWeatherStore();

  // Mapping current weather data from app.py
  const data = {
    humidity: weatherData!.current.relative_humidity_2m,
    windSpeed: weatherData!.current.wind_speed_10m,
    precipitation: weatherData!.current.precipitation, // cm/mm
    uvIndex: weatherData!.hourly.uv_index[0],
    feelsLike: Math.round(weatherData!.current.apparent_temperature),
    chanceOfRain: weatherData!.hourly.precipitation_probability[0],
  };

  // Humidity status
  const humStatus = data.humidity > 70 ? 'bad' : data.humidity < 30 ? 'bad' : 'normal';
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 text-slate-800">More details of today's weather</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Humidity Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <CardHeader title="Humidity" icon={Droplets} />
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="text-3xl font-semibold mb-1">
              {data.humidity}% <span className="text-base font-normal text-slate-500">{humStatus}</span>
            </div>
            <div className="w-full flex gap-2 mt-6">
              <div className="flex flex-col flex-1 gap-2">
                <span className="text-xs text-slate-400 font-medium text-center">good</span>
                <div className={cn("h-2 rounded-full", data.humidity <= 50 ? "bg-blue-500" : "bg-slate-200")} />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <span className="text-xs text-slate-400 font-medium text-center">normal</span>
                <div className={cn("h-2 rounded-full", data.humidity > 30 && data.humidity <= 70 ? "bg-blue-500" : "bg-slate-200")} />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <span className="text-xs text-slate-400 font-medium text-center">bad</span>
                <div className={cn("h-2 rounded-full", data.humidity > 70 ? "bg-blue-500" : "bg-slate-200")} />
              </div>
            </div>
          </div>
        </div>

        {/* Wind Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm hover:-translate-y-1 transition-transform relative overflow-hidden">
          <CardHeader title="Wind" icon={Wind} />
          <div className="relative h-[100px] w-full flex items-end justify-center pb-2">
            {/* SVG semi circle gauge */}
            <svg viewBox="0 0 200 100" className="absolute top-0 w-full h-full text-slate-200">
              <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeDasharray="4 8" />
              <path d="M 20 90 A 80 80 0 0 1 100 10" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" className="transition-all duration-1000" />
              {/* Dial pointer */}
              <g transform={`rotate(${data.windSpeed * 3} 100 90)`} className="transition-transform duration-1000 origin-[100px_90px]">
                <path d="M 95 90 L 100 20 L 105 90 Z" fill="#3b82f6" />
                <circle cx="100" cy="90" r="8" fill="#1e40af" />
              </g>
              <text x="30" y="50" fontSize="12" fill="#94A3B8">5</text>
              <text x="80" y="25" fontSize="12" fill="#94A3B8">10</text>
              <text x="140" y="25" fontSize="12" fill="#94A3B8">20</text>
              <text x="175" y="70" fontSize="12" fill="#94A3B8">30</text>
              <text x="180" y="100" fontSize="12" fill="#94A3B8">40</text>
            </svg>
            <div className="text-2xl font-semibold bg-white px-2 relative z-10">
              {data.windSpeed} <span className="text-base text-slate-500 font-normal">km/h</span>
            </div>
          </div>
        </div>

        {/* Precipitation Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <CardHeader title="Precipitation" icon={CloudRain} />
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="text-3xl font-semibold mb-6">
              {data.precipitation} <span className="text-base font-normal text-slate-500">cm</span>
            </div>
            <div className="w-full flex justify-between px-2">
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">{val}</span>
                  <div className={cn("w-[14px] h-[8px] rounded-full", val < (data.precipitation * 10) ? "bg-blue-500" : "bg-slate-200")} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* UV Index Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <CardHeader title="UV index" icon={Sun} />
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="text-3xl font-semibold mb-6">
              {data.uvIndex} <span className="text-base font-normal text-slate-500">{data.uvIndex > 7 ? 'high' : data.uvIndex > 3 ? 'medium' : 'low'}</span>
            </div>
            <div className="w-full flex gap-2">
              {[
                { label: '0-2', max: 2 },
                { label: '3-5', max: 5 },
                { label: '6-7', max: 7 },
                { label: '8-10', max: 10 },
                { label: '11+', max: 15 }
              ].map((range, i) => (
                <div key={i} className="flex flex-col flex-1 items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">{range.label}</span>
                  <div className={cn("h-2 w-full rounded-full", data.uvIndex >= range.max - 2 ? "bg-blue-500" : "bg-slate-200")} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feels Like Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <CardHeader title="Feels like" icon={Thermometer} />
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="text-3xl font-semibold mb-8">
              {data.feelsLike}°
            </div>
            <div className="w-full relative px-2">
              <div className="flex justify-between absolute w-full left-0 -top-6 text-xs text-slate-400 font-medium px-2">
                <span>0°</span>
                <span>25°</span>
                <span>50°</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(Math.max((data.feelsLike / 50) * 100, 0), 100)}%` }}
                />
                <div 
                  className="absolute w-3 h-3 bg-white rounded-full border-2 border-blue-500 top-1/2 -translate-y-1/2 transition-all duration-1000"
                  style={{ left: `calc(${Math.min(Math.max((data.feelsLike / 50) * 100, 0), 100)}% - 6px)` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chance of Rain Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm hover:-translate-y-1 transition-transform">
          <CardHeader title="Chance of rain" icon={CloudDrizzle} />
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="text-3xl font-semibold mb-8">
              {data.chanceOfRain}%
            </div>
            <div className="w-full relative px-2">
              <div className="flex justify-between absolute w-full left-0 -top-6 text-xs text-slate-400 font-medium px-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${data.chanceOfRain}%` }}
                />
                <div 
                  className="absolute w-3 h-3 bg-white rounded-full border-2 border-blue-500 top-1/2 -translate-y-1/2 transition-all duration-1000"
                  style={{ left: `calc(${data.chanceOfRain}% - 6px)` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
