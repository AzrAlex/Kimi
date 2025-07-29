import React, { useState, useEffect } from 'react';
import { mouvementsAPI, articlesAPI } from '../services/api';
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

const Mouvements = () => {
  const [mouvements, setMouvements] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    article_id: '',
    type: 'entree',
    quantite: '',
    raison: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mouvementsResponse, articlesResponse] = await Promise.all([
        mouvementsAPI.getAll(),
        articlesAPI.getAll()
      ]);
      setMouvements(mouvementsResponse.data);
      setArticles(articlesResponse.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Mouvements error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await mouvementsAPI.create({
        article_id: formData.article_id,
        type: formData.type,
        quantite: parseInt(formData.quantite),
        raison: formData.raison
      });

      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create movement');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setFormData({
      article_id: '',
      type: 'entree',
      quantite: '',
      raison: ''
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'entree':
        return 'bg-green-100 text-green-800';
      case 'sortie':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'entree':
        return <ArrowUpIcon className="h-4 w-4" />;
      case 'sortie':
        return <ArrowDownIcon className="h-4 w-4" />;
      default:
        return <ArrowUpIcon className="h-4 w-4" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600">Track inventory movements</p>
        </div>
        <button
          onClick={openModal}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Movement
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Movements Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mouvements.map((mouvement) => (
                <tr key={mouvement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {mouvement.article_nom || 'Unknown Article'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(mouvement.type)}`}>
                      {getTypeIcon(mouvement.type)}
                      <span className="ml-1 capitalize">{mouvement.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {mouvement.quantite}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {mouvement.user_nom || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {mouvement.raison}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(mouvement.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mouvements.length === 0 && (
          <div className="text-center py-12">
            <ArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No movements</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new movement.</p>
            <div className="mt-6">
              <button onClick={openModal} className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Movement
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
                New Movement
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
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    required
                    className="input-field mt-1"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="entree">Entry (Stock In)</option>
                    <option value="sortie">Exit (Stock Out)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    name="quantite"
                    required
                    min="1"
                    className="input-field mt-1"
                    value={formData.quantite}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    name="raison"
                    rows="3"
                    required
                    className="input-field mt-1"
                    placeholder="Describe the reason for this movement"
                    value={formData.raison}
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
                    {submitting ? 'Creating...' : 'Create Movement'}
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

export default Mouvements;