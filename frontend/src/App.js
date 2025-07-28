import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const StatCard = ({ title, value, icon, color = "blue" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 border-${color}-500 transform hover:scale-105 transition-transform duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`text-3xl text-${color}-500`}>
        {icon}
      </div>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Stockify</h1>
          <p className="text-gray-600">Connexion à votre compte</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Comptes de démonstration :</p>
          <p><strong>Admin:</strong> admin@stockify.com / admin123</p>
          <p><strong>User:</strong> user@stockify.com / user123</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers }),
        axios.get(`${API}/dashboard/alerts`, { headers })
      ]);
      
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Tableau de bord - {user?.nom}
        </h1>
        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
          {user?.role}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Articles" 
          value={stats?.total_articles || 0} 
          icon="📦" 
          color="blue"
        />
        <StatCard 
          title="Utilisateurs" 
          value={stats?.total_users || 0} 
          icon="👥" 
          color="green"
        />
        <StatCard 
          title="Demandes" 
          value={stats?.total_demandes || 0} 
          icon="📋" 
          color="purple"
        />
        <StatCard 
          title="Stock Faible" 
          value={stats?.articles_low_stock || 0} 
          icon="⚠️" 
          color="red"
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            🚨 Alertes
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'stock_low' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{alert.nom}</h3>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.type === 'stock_low' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.type === 'stock_low' ? 'Stock faible' : 'Expire bientôt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ArticlesList = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== 'image' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (editingArticle) {
        await axios.put(`${API}/articles/${editingArticle.id}`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API}/articles`, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setShowModal(false);
      setEditingArticle(null);
      setFormData({
        nom: '',
        description: '',
        quantite: '',
        quantite_min: '',
        date_expiration: '',
        image: null
      });
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      nom: article.nom,
      description: article.description,
      quantite: article.quantite,
      quantite_min: article.quantite_min,
      date_expiration: article.date_expiration ? article.date_expiration.split('T')[0] : '',
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/articles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Articles</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Nouvel Article
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">{article.nom}</h3>
                {user?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{article.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Quantité:</span>
                  <span className={`font-bold ${article.quantite <= article.quantite_min ? 'text-red-600' : 'text-green-600'}`}>
                    {article.quantite}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Minimum:</span>
                  <span className="font-medium">{article.quantite_min}</span>
                </div>
                {article.date_expiration && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Expiration:</span>
                    <span className="font-medium text-sm">
                      {new Date(article.date_expiration).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {article.code_qr && (
                <div className="mt-4 text-center">
                  <img 
                    src={article.code_qr} 
                    alt="QR Code" 
                    className="mx-auto w-20 h-20 border rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for adding/editing articles */}
      <Modal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingArticle(null);
          setFormData({
            nom: '',
            description: '',
            quantite: '',
            quantite_min: '',
            date_expiration: '',
            image: null
          });
        }}
        title={editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité minimum
              </label>
              <input
                type="number"
                value={formData.quantite_min}
                onChange={(e) => setFormData({...formData, quantite_min: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'expiration
            </label>
            <input
              type="date"
              value={formData.date_expiration}
              onChange={(e) => setFormData({...formData, date_expiration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingArticle ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const DemandesList = ({ user }) => {
  const [demandes, setDemandes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    article_id: '',
    quantite_demandee: ''
  });

  useEffect(() => {
    fetchDemandes();
    fetchArticles();
  }, []);

  const fetchDemandes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/demandes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDemandes(response.data);
    } catch (error) {
      console.error('Error fetching demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/demandes`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setFormData({ article_id: '', quantite_demandee: '' });
      fetchDemandes();
    } catch (error) {
      console.error('Error creating demande:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/demandes/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDemandes();
    } catch (error) {
      console.error('Error approving demande:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/demandes/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDemandes();
    } catch (error) {
      console.error('Error rejecting demande:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Demandes d'Articles</h1>
        {user?.role === 'user' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Nouvelle Demande
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {user?.role === 'admin' && (
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
                      {demande.article_nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{demande.user_nom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{demande.quantite_demandee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      demande.statut === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      demande.statut === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {demande.statut === 'pending' ? 'En attente' :
                       demande.statut === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(demande.date_demande).toLocaleDateString()}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {demande.statut === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(demande.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✅ Approuver
                          </button>
                          <button
                            onClick={() => handleReject(demande.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ❌ Rejeter
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
      </div>

      {/* Modal for creating new demande */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Nouvelle demande"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article
            </label>
            <select
              value={formData.article_id}
              onChange={(e) => setFormData({...formData, article_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un article</option>
              {articles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.nom} (Stock: {article.quantite})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité demandée
            </label>
            <input
              type="number"
              value={formData.quantite_demandee}
              onChange={(e) => setFormData({...formData, quantite_demandee: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer la demande
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeTab, setActiveTab, user, onLogout }) => {
  const adminTabs = [
    { id: 'dashboard', name: 'Tableau de bord', icon: '📊' },
    { id: 'articles', name: 'Articles', icon: '📦' },
    { id: 'demandes', name: 'Demandes', icon: '📋' },
  ];

  const userTabs = [
    { id: 'dashboard', name: 'Tableau de bord', icon: '📊' },
    { id: 'articles', name: 'Articles', icon: '📦' },
    { id: 'demandes', name: 'Mes Demandes', icon: '📋' },
  ];

  const tabs = user?.role === 'admin' ? adminTabs : userTabs;

  return (
    <nav className="bg-white shadow-lg rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.nom} ({user?.role})
          </span>
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'articles':
        return <ArticlesList user={user} />;
      case 'demandes':
        return <DemandesList user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📦 Stockify
          </h1>
          <p className="text-gray-600">Système de gestion de stock intelligent</p>
        </header>
        
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;