import React, { useState, useEffect } from 'react';
import { historiqueAPI } from '../services/api';
import {
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Historique = () => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistorique();
  }, []);

  const fetchHistorique = async () => {
    try {
      setLoading(true);
      const response = await historiqueAPI.getAll();
      setHistorique(response.data);
    } catch (err) {
      setError('Failed to load history');
      console.error('Historique error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
        <p className="text-gray-600">Track all system activities</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* History Timeline */}
      <div className="card">
        {historique.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity</h3>
            <p className="mt-1 text-sm text-gray-500">No activities have been recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historique.map((action, index) => (
              <div key={action.id} className="flex items-start space-x-3">
                {/* Timeline dot */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                    <UserIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  {index < historique.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mx-auto mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(action.action)}`}>
                      {action.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {action.user_nom || 'Unknown User'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(action.created_at).toLocaleDateString()} {new Date(action.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="mt-1">
                    <p className="text-sm text-gray-700">
                      {action.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>Target: {action.cible_type}</span>
                      <span>ID: {action.cible_id.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historique;