import React from 'react';
import { WeatherData } from '../services/mockApi';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain': return '🌧️';
      case 'cloudy': return '☁️';
      case 'clear': return '☀️';
      default: return '🌤️';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Faridabad Weather</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
            <span className="text-2xl font-bold text-gray-900">{weather.temp}°C</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>💧</span>
            <span>{weather.humidity}%</span>
          </div>
          {weather.rain > 0 && (
            <div className="flex items-center space-x-1 text-sm text-blue-600 mt-1">
              <span>🌧️</span>
              <span>{weather.rain}mm</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">{weather.condition}</p>
        </div>
      </div>
      {weather.source === 'fallback' && (
        <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded px-2 py-1">
          ℹ️ Demo weather data (API key not configured)
        </p>
      )}
    </div>
  );
};
