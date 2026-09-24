import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { WeatherWidget } from '../components/WeatherWidget';
import { RecommendationCard } from '../components/RecommendationCard';
import { AlertBanner } from '../components/AlertBanner';
import { useAuth } from '../context/AuthContext';
import { apiService, WeatherData, Recommendation } from '../services/mockApi';
import { formatDate, getGreeting } from '../utils/formatters';
import { FRANCHISES } from '../utils/constants';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const franchise = FRANCHISES.find(f => f.id === user?.franchiseId);
  const todayFestival = apiService.getTodayFestival();

  useEffect(() => {
    const loadData = async () => {
      if (!user?.franchiseId) return;

      try {
        const [weatherData, recs] = await Promise.all([
          apiService.getWeather(),
          apiService.getRecommendations(user.franchiseId),
        ]);
        setWeather(weatherData);
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
        setWeatherLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <Layout>
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">{formatDate(new Date())}</p>
        {franchise && (
          <p className="text-sm text-orange-600 font-medium mt-1">📍 {franchise.name}</p>
        )}
      </div>

      {/* Festival Alert */}
      {todayFestival && (
        <div className="mb-4">
          <AlertBanner
            type="festival"
            title={`🎊 ${todayFestival.name} Today!`}
            message={`Festival demand multiplier of ${todayFestival.multiplier}× has been applied to all recommendations. Expect higher footfall!`}
            icon="🎉"
          />
        </div>
      )}

      {/* Weather Alert for Rain */}
      {weather && weather.rain > 0 && (
        <div className="mb-4">
          <AlertBanner
            type="weather"
            title="Rainy Day Alert"
            message="Cold drink demand may be lower today. Hot food demand may increase. Adjustments applied."
            icon="🌧️"
          />
        </div>
      )}

      {/* Weather Widget */}
      <div className="mb-6">
        <WeatherWidget weather={weather} loading={weatherLoading} />
      </div>

      {/* Recommendations */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Today's Preparation Plan</h2>
        <p className="text-sm text-gray-500">
          Data-driven recommendations based on sales history, weather & day patterns
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded mb-3"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recommendations.map(rec => (
            <RecommendationCard key={rec.itemId} recommendation={rec} />
          ))}
        </div>
      )}

      {/* Formula Explanation */}
      <div className="mt-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-2">📐 How Recommendations Work</h3>
        <p className="text-sm text-gray-600 mb-3">
          Each item's suggested quantity is calculated using:
        </p>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800">
          Suggested Qty = Base Demand × Weather × Festival × Day-of-Week
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="font-medium text-blue-700">Base Demand</p>
            <p className="text-blue-600">45-day avg sales</p>
          </div>
          <div className="bg-cyan-50 rounded-lg p-2">
            <p className="font-medium text-cyan-700">Weather</p>
            <p className="text-cyan-600">Temp, rain, humidity</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="font-medium text-purple-700">Festival</p>
            <p className="text-purple-600">Special day boost</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="font-medium text-green-700">Day Factor</p>
            <p className="text-green-600">Weekend patterns</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
