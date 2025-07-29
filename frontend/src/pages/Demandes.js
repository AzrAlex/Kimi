import React, { useState, useEffect } from 'react';
import { demandesAPI, articlesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Demandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    article_id: '',
    quantite_demandee: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [demandesResponse, articlesResponse] = await Promise.all([
        demandesAPI.getAll(),
        articlesAPI.getAll()
      ]);
      setDemandes(demandesResponse.data);
      setArticles(articlesResponse.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Demandes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await demandesAPI.create({
        article_id: formData.article_id,
        quantite_demandee: parseInt(formData.quantite_demandee)
      });

      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (demandeId) => {
    try {
      await demandesAPI.approve(demandeId);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve request');
    }
  };

  const handleReject = async (demandeId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await demandesAPI.reject(demandeId);
        await fetchData();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to reject request');
      }
    }
  };

  const openModal = () => {
    setFormData({
      article_id: '',
      quantite_demandee: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'approved':
        return <CheckIcon className="h-4 w-4" />;
      case 'rejected':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
          <p className="text-gray-600">Manage inventory requests</p>
        </div>
        <button
          onClick={openModal}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Requests Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {isAdmin() && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demandes.map((demande) => (
                <tr key={demande.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {demande.article_nom || 'Unknown Article'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {demande.user_nom || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {demande.quantite_demandee}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(demande.statut)}`}>
                      {getStatusIcon(demande.statut)}
                      <span className="ml-1 capitalize">{demande.statut}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(demande.date_demande).toLocaleDateString()}
                  </td>
                  {isAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {demande.statut === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(demande.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(demande.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {demandes.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new request.</p>
            <div className="mt-6">
              <button onClick={openModal} className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Request
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                New Request
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Article</label>
                  <select
                    name="article_id"
                    required
                    className="input-field mt-1"
                    value={formData.article_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select an article</option>
                    {articles.map((article) => (
                      <option key={article.id} value={article.id}>
                        {article.nom} (Stock: {article.quantite})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity Requested</label>
                  <input
                    type="number"
                    name="quantite_demandee"
                    required
                    min="1"
                    className="input-field mt-1"
                    value={formData.quantite_demandee}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demandes;