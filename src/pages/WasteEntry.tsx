import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/mockApi';
import { MENU_ITEMS } from '../utils/constants';

export const WasteEntry: React.FC = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState('');
  const [qtyPrepared, setQtyPrepared] = useState('');
  const [qtyLeftover, setQtyLeftover] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [todayLogs, setTodayLogs] = useState<Array<{ itemName: string; qtyPrepared: number; qtyLeftover: number; wastagePercent: number }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.franchiseId || !selectedItem) return;

    const prepared = parseInt(qtyPrepared);
    const leftover = parseInt(qtyLeftover);

    if (prepared <= 0) {
      setError('Prepared quantity must be greater than zero.');
      return;
    }
    if (leftover < 0) {
      setError('Leftover quantity cannot be negative.');
      return;
    }
    if (leftover > prepared) {
      setError('Leftover quantity cannot exceed prepared quantity.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const log = await apiService.logWaste(user.franchiseId, selectedItem, prepared, leftover);
      setTodayLogs(prev => [...prev, {
        itemName: log.itemName,
        qtyPrepared: log.qtyPrepared,
        qtyLeftover: log.qtyLeftover,
        wastagePercent: log.wastagePercent,
      }]);
      setSuccess(true);
      setSelectedItem('');
      setQtyPrepared('');
      setQtyLeftover('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save waste log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📝 Evening Waste Entry</h1>
          <p className="text-gray-500 mt-1">Record today's leftover food quantities</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="text-xl">✅</span>
              <p className="text-green-700 font-medium">Waste log saved successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-5">
            {/* Menu Item Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🍽️ Menu Item
              </label>
              <select
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 text-lg bg-white"
                required
              >
                <option value="">Select item...</option>
                {MENU_ITEMS.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prepared Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📦 Quantity Prepared
              </label>
              <input
                type="number"
                value={qtyPrepared}
                onChange={e => setQtyPrepared(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 text-2xl font-bold"
                placeholder="0"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Total portions cooked/prepared today</p>
            </div>

            {/* Leftover Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🗑️ Quantity Leftover
              </label>
              <input
                type="number"
                value={qtyLeftover}
                onChange={e => setQtyLeftover(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 text-2xl font-bold"
                placeholder="0"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Unsold portions at end of day</p>
            </div>

            {/* Live Wastage Preview */}
            {qtyPrepared && qtyLeftover && parseInt(qtyPrepared) > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Estimated Wastage:</p>
                <p className={`text-2xl font-bold ${
                  (parseInt(qtyLeftover) / parseInt(qtyPrepared)) * 100 <= 8 
                    ? 'text-green-600' 
                    : (parseInt(qtyLeftover) / parseInt(qtyPrepared)) * 100 <= 15 
                    ? 'text-amber-600' 
                    : 'text-red-600'
                }`}>
                  {((parseInt(qtyLeftover) / parseInt(qtyPrepared)) * 100).toFixed(1)}%
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedItem}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  <span>Saving...</span>
                </span>
              ) : (
                '💾 Save Evening Log'
              )}
            </button>
          </div>
        </form>

        {/* Today's Logs */}
        {todayLogs.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Entries</h3>
            <div className="space-y-3">
              {todayLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{log.itemName}</p>
                    <p className="text-xs text-gray-500">
                      Prepared: {log.qtyPrepared} | Leftover: {log.qtyLeftover}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    log.wastagePercent <= 8 
                      ? 'bg-green-100 text-green-700' 
                      : log.wastagePercent <= 15 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {log.wastagePercent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
