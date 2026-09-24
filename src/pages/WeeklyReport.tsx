import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/mockApi';
import { formatShortDate } from '../utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportData {
  dailyWastage: { date: string; wastagePercent: number }[];
  beforeDineOps: number;
  currentWastage: number;
}

export const WeeklyReport: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      if (!user?.franchiseId) return;
      try {
        const report = await apiService.getWeeklyReport(user.franchiseId);
        setData({
          dailyWastage: report.dailyWastage,
          beforeDineOps: report.beforeDineOps,
          currentWastage: report.currentWastage,
        });
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const reduction = data.beforeDineOps - data.currentWastage;

  // Line chart data
  const lineChartData = {
    labels: data.dailyWastage.map(d => formatShortDate(new Date(d.date))),
    datasets: [
      {
        label: 'Wastage %',
        data: data.dailyWastage.map(d => d.wastagePercent),
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(234, 88, 12)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Target (8%)',
        data: data.dailyWastage.map(() => 8),
        borderColor: 'rgb(34, 197, 94)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Wastage Trend (Last 7 Days)',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  // Bar chart data
  const barChartData = {
    labels: ['Before DineOps', 'Current (With DineOps)'],
    datasets: [
      {
        label: 'Wastage %',
        data: [data.beforeDineOps, data.currentWastage],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Wastage: Before vs After DineOps',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📈 Weekly Waste Report</h1>
          <p className="text-gray-500 mt-1">Performance overview for the last 7 days</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Before DineOps</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{data.beforeDineOps}%</p>
            <p className="text-xs text-gray-400 mt-1">Historical baseline</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Current Wastage</p>
            <p className={`text-3xl font-bold mt-1 ${
              data.currentWastage <= 8 ? 'text-green-600' : data.currentWastage <= 15 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {data.currentWastage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">7-day average</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Reduction</p>
            <p className={`text-3xl font-bold mt-1 ${reduction > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {reduction > 0 ? '↓' : '↑'} {Math.abs(reduction).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {reduction > 0 ? 'Improvement!' : 'Needs attention'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="h-72">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="h-72">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Status Legend */}
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
