import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  CubeIcon,
  UsersIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, alertsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getAlerts()
      ]);
      
      setStats(statsResponse.data);
      setAlerts(alertsResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'stock_low':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'expiring_soon':
        return <ClockIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'stock_low':
        return 'bg-yellow-50 border-yellow-200';
      case 'expiring_soon':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory system</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_articles}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_demandes}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.articles_low_stock}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Alerts & Notifications</h2>
          <p className="text-sm text-gray-500">Items that need your attention</p>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
            <p className="mt-1 text-sm text-gray-500">All your inventory items are in good condition.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {alert.nom}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500">Common tasks</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/articles"
            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <CubeIcon className="h-6 w-6 text-primary-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Manage Articles</p>
                <p className="text-sm text-gray-500">Add, edit, or view inventory items</p>
              </div>
            </div>
          </a>

          <a
            href="/demandes"
            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">View Requests</p>
                <p className="text-sm text-gray-500">Manage inventory requests</p>
              </div>
            </div>
          </a>

          <a
            href="/historique"
            className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-primary-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">View History</p>
                <p className="text-sm text-gray-500">Track all system activities</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;