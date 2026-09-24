import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiService } from '../services/mockApi';
import { formatShortDate } from '../utils/formatters';

interface Festival {
  id: string;
  name: string;
  date: string;
  multiplier: number;
}

export const FestivalManagement: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newMultiplier, setNewMultiplier] = useState('1.5');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFestivals();
  }, []);

  const loadFestivals = async () => {
    try {
      const data = await apiService.getAllFestivals();
      setFestivals(data);
    } catch (err) {
      console.error('Failed to load festivals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDate || !newMultiplier) return;

    setSaving(true);
    try {
      await apiService.addFestival(newName, newDate, parseFloat(newMultiplier));
      setNewName('');
      setNewDate('');
      setNewMultiplier('1.5');
      setShowForm(false);
      await loadFestivals();
    } catch (err) {
      console.error('Failed to add festival:', err);
    } finally {
      setSaving(false);
    }
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return dateStr === todayStr;
  };

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) > new Date();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎉 Festival Management</h1>
            <p className="text-gray-500 mt-1">Manage festival calendar and demand multipliers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-3 sm:mt-0 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            {showForm ? '✕ Cancel' : '+ Add Festival'}
          </button>
        </div>

        {/* Add Festival Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Festival</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Festival Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="e.g., Raksha Bandhan"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demand Multiplier</label>
                <input
                  type="number"
                  value={newMultiplier}
                  onChange={e => setNewMultiplier(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '✓ Save'}
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              💡 Multiplier of 1.5 means 50% more food will be recommended for that day.
            </p>
          </div>
        )}

        {/* Festival Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Festival Calendar 2026</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {festivals.map(festival => (
              <div
                key={festival.id}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  isToday(festival.date) ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-gray-500 uppercase">
                      {new Date(festival.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(festival.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {festival.name}
                      {isToday(festival.date) && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          TODAY
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(festival.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center space-x-1 px-3 py-1.5 bg-orange-50 rounded-lg">
                    <span className="text-xs text-orange-600 font-medium">Multiplier:</span>
                    <span className="text-sm font-bold text-orange-700">{festival.multiplier}×</span>
                  </div>
                  {!isToday(festival.date) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {isUpcoming(festival.date) ? 'Upcoming' : 'Past'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
          <h3 className="font-semibold text-purple-900 mb-2">🎊 How Festival Multipliers Work</h3>
          <p className="text-sm text-purple-700">
            During festivals, customer demand typically increases. The demand multiplier is applied to 
            the base preparation recommendation. For example, a multiplier of 1.8× for Diwali means 
            the system will recommend 80% more food than the normal daily average.
          </p>
          <div className="mt-3 bg-white/60 rounded-lg p-3 font-mono text-sm text-purple-800">
            Festival Suggested Qty = Base Demand × Weather × <span className="font-bold">Multiplier</span> × Day Factor
          </div>
        </div>
      </div>
    </Layout>
  );
};
