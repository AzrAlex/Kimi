import React, { useState, useEffect } from 'react';
import { articlesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    quantite: '',
    quantite_min: '',
    date_expiration: '',
    image: null
  });
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getAll();
      setArticles(response.data);
    } catch (err) {
      setError('Failed to load articles');
      console.error('Articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('quantite', formData.quantite);
      formDataToSend.append('quantite_min', formData.quantite_min);
      if (formData.date_expiration) {
        formDataToSend.append('date_expiration', formData.date_expiration);
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingArticle) {
        await articlesAPI.update(editingArticle.id, formDataToSend);
      } else {
        await articlesAPI.create(formDataToSend);
      }

      await fetchArticles();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await articlesAPI.delete(articleId);
        await fetchArticles();
      } catch (err) {
        setError('Failed to delete article');
        console.error('Delete error:', err);
      }
    }
  };

  const openModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        nom: article.nom,
        description: article.description,
        quantite: article.quantite.toString(),
        quantite_min: article.quantite_min.toString(),
        date_expiration: article.date_expiration ? article.date_expiration.split('T')[0] : '',
        image: null
      });
    } else {
      setEditingArticle(null);
      setFormData({
        nom: '',
        description: '',
        quantite: '',
        quantite_min: '',
        date_expiration: '',
        image: null
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArticle(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isLowStock = (article) => {
    return article.quantite <= article.quantite_min;
  };

  const isExpiringSoon = (article) => {
    if (!article.date_expiration) return false;
    const expirationDate = new Date(article.date_expiration);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expirationDate <= thirtyDaysFromNow && expirationDate >= today;
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
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">Manage your inventory items</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Article
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <div key={article.id} className="card relative">
            {/* Stock/Expiration Indicators */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {isLowStock(article) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  Low Stock
                </span>
              )}
              {isExpiringSoon(article) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Expiring Soon
                </span>
              )}
            </div>

            {/* Article Image */}
            <div className="mb-4">
              {article.image ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/${article.image}`}
                  alt={article.nom}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Article Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">{article.nom}</h3>
              <p className="text-sm text-gray-600">{article.description}</p>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stock:</span>
                <span className={`font-medium ${isLowStock(article) ? 'text-red-600' : 'text-green-600'}`}>
                  {article.quantite} / {article.quantite_min} min
                </span>
              </div>

              {article.date_expiration && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expires:</span>
                  <span className={`font-medium ${isExpiringSoon(article) ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(article.date_expiration).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* QR Code */}
              {article.code_qr && (
                <div className="flex items-center justify-center mt-4">
                  <div className="p-2 border rounded-lg">
                    <img src={article.code_qr} alt="QR Code" className="w-16 h-16" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {isAdmin() && (
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => openModal(article)}
                  className="p-2 text-gray-400 hover:text-primary-600"
                  title="Edit"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new article.</p>
          {isAdmin() && (
            <div className="mt-6">
              <button onClick={() => openModal()} className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Article
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    className="input-field mt-1"
                    value={formData.nom}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    required
                    className="input-field mt-1"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      name="quantite"
                      required
                      min="0"
                      className="input-field mt-1"
                      value={formData.quantite}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Quantity</label>
                    <input
                      type="number"
                      name="quantite_min"
                      required
                      min="0"
                      className="input-field mt-1"
                      value={formData.quantite_min}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="date"
                    name="date_expiration"
                    className="input-field mt-1"
                    value={formData.date_expiration}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="input-field mt-1"
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
                    {submitting ? 'Saving...' : (editingArticle ? 'Update' : 'Create')}
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

export default Articles;