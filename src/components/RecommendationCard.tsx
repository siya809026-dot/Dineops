import React from 'react';
import { Recommendation } from '../services/mockApi';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'green':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">✓ On Track</span>;
      case 'amber':
        return <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">⚠ Monitor</span>;
      case 'red':
        return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">🔴 High Demand</span>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hot_food': return '🍛';
      case 'cold_drinks': return '🥤';
      case 'hot_drinks': return '☕';
      case 'desserts': return '🍮';
      default: return '🍽️';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hot_food': return 'Hot Food';
      case 'cold_drinks': return 'Cold Drinks';
      case 'hot_drinks': return 'Hot Drinks';
      case 'desserts': return 'Desserts';
      default: return category;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getCategoryIcon(recommendation.category)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{recommendation.itemName}</h3>
            <p className="text-xs text-gray-500">{getCategoryLabel(recommendation.category)}</p>
          </div>
        </div>
        {getStatusBadge(recommendation.status)}
      </div>

      <div className="bg-orange-50 rounded-lg p-3 mb-3">
        <p className="text-xs text-orange-600 font-medium">Suggested Preparation</p>
        <p className="text-3xl font-bold text-orange-700">{recommendation.suggestedQty}</p>
        <p className="text-xs text-orange-500">portions</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Base Demand</p>
          <p className="font-semibold text-gray-900">{recommendation.baseDemand}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Weather ×</p>
          <p className="font-semibold text-gray-900">{recommendation.weatherMultiplier.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Festival ×</p>
          <p className="font-semibold text-gray-900">{recommendation.festivalMultiplier.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500">Day Factor ×</p>
          <p className="font-semibold text-gray-900">{recommendation.dayOfWeekFactor.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
