import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiService, FranchiseComparison } from '../services/mockApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AdminDashboard: React.FC = () => {
  const [comparisons, setComparisons] = useState<FranchiseComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getFranchiseComparison();
        setComparisons(data);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  // Chart data
  const chartData = {
    labels: comparisons.map(c => c.franchiseName.replace('Pindi Junction - ', '')),
    datasets: [
      {
        label: 'Wastage %',
        data: comparisons.map(c => c.wastagePercent),
        backgroundColor: comparisons.map(c =>
          c.status === 'green' ? 'rgba(34, 197, 94, 0.8)' :
          c.status === 'amber' ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: comparisons.map(c =>
          c.status === 'green' ? 'rgb(34, 197, 94)' :
          c.status === 'amber' ? 'rgb(245, 158, 11)' :
          'rgb(239, 68, 68)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Franchise Wastage Comparison',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        ticks: { callback: (value: any) => `${value}%` },
      },
    },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'green':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">✓ On Track</span>;
      case 'amber':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">⚠ Warning</span>;
      case 'red':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">🔴 Critical</span>;
      default:
        return null;
    }
  };

  const totalPrepared = comparisons.reduce((sum, c) => sum + c.totalPrepared, 0);
  const totalLeftover = comparisons.reduce((sum, c) => sum + c.totalLeftover, 0);
  const avgWastage = comparisons.reduce((sum, c) => sum + c.wastagePercent, 0) / comparisons.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏢 Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Franchise performance comparison & oversight</p>
          </div>
          <button
            onClick={() => {
              const csvContent = [
                'Franchise,Location,Prepared,Leftover,Wastage %,Status',
                ...comparisons.map(c => `${c.franchiseName},${c.location},${c.totalPrepared},${c.totalLeftover},${c.wastagePercent}%,${c.status}`)
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'dineops-weekly-report.csv';
              a.click();
            }}
            className="mt-3 sm:mt-0 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            📥 Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Prepared</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalPrepared.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">All franchises combined</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Total Leftover</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{totalLeftover.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Across all franchises</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Avg Wastage</p>
            <p className={`text-3xl font-bold mt-1 ${
              avgWastage <= 8 ? 'text-green-600' : avgWastage <= 15 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {avgWastage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Network average</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Franchise Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Franchise</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Prepared</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Leftover</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Wastage %</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisons.map(c => (
                  <tr key={c.franchiseId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 text-sm">{c.franchiseName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600">{c.location}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">{c.totalPrepared.toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-amber-600">{c.totalLeftover.toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className={`text-sm font-bold ${
                        c.wastagePercent <= 8 ? 'text-green-600' : c.wastagePercent <= 15 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {c.wastagePercent.toFixed(1)}%
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(c.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Threshold Legend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Status Thresholds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-700">On Track</p>
                <p className="text-xs text-green-600">≤ 8% wastage</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-amber-700">Warning</p>
                <p className="text-xs text-amber-600">8% - 15% wastage</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-red-700">Critical</p>
                <p className="text-xs text-red-600">&gt; 15% wastage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
