import React from 'react';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, Sun, Cloud, CloudRain } from 'lucide-react';
import { useWeatherStore } from '../store/useWeatherStore';

export const UpcomingHours: React.FC = () => {
  const { weatherData } = useWeatherStore();

  // weatherData is guaranteed to exist because this component only renders if weatherData is true
  const data = weatherData!.hourly.time.slice(0, 7).map((t, i) => ({
    time: i === 0 ? 'Now' : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(weatherData!.hourly.temperature_2m[i]),
    precip: weatherData!.hourly.precipitation_probability[i],
    icon: weatherData!.hourly.weather_code[i] > 50 ? 'rain' : weatherData!.hourly.weather_code[i] > 0 ? 'cloud' : 'sun'
  }));

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const point = data.find(d => d.time === payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="500">
          {payload.value}
        </text>
        <text x={0} y={0} dy={38} textAnchor="middle" fill="#94A3B8" fontSize="12">
          {point?.precip}%
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-medium">Upcoming hours</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-100">
            Rain precipitation <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 text-sm text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 font-medium">
            Next days <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="h-[200px] w-full relative">
        {/* Custom top labels since Recharts doesn't natively support top & bottom X axis easily without complex compose charts */}
        <div className="absolute top-0 w-full flex justify-between px-[20px] z-10">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-8">
              {d.icon === 'sun' && <Sun size={20} className="text-yellow-400" fill="currentColor"/>}
              {d.icon === 'cloud' && <Cloud size={20} className="text-slate-400" fill="currentColor"/>}
              {d.icon === 'rain' && <CloudRain size={20} className="text-blue-400" fill="currentColor"/>}
              <span className="font-semibold text-lg">{d.temp}°</span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pt-[50px] pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4b85d0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4b85d0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={<CustomTick />} 
                interval={0}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#4b85d0" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
