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
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const limit = 9; // 3x3 grid
  
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
  }, [currentPage, searchTerm, lowStockFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchArticles();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (lowStockFilter) params.append('low_stock', lowStockFilter);

      const response = await axios.get(`${API}/articles?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setArticles(response.data.items);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filterOptions = [
    { value: 'true', label: 'Stock faible uniquement' },
    { value: 'false', label: 'Stock normal uniquement' }
  ];

  const sortOptions = [
    { value: 'nom', label: 'Nom' },
    { value: 'quantite', label: 'Quantité' },
    { value: 'created_at', label: 'Date de création' },
    { value: 'updated_at', label: 'Dernière modification' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Rechercher des articles..."
          />
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <FilterSelect
              value={lowStockFilter}
              onChange={setLowStockFilter}
              options={filterOptions}
              placeholder="Filtrer par stock"
              className="w-full sm:w-auto"
            />
            
            <FilterSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="Trier par"
              className="w-full sm:w-auto"
            />
            
            <FilterSelect
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: 'asc', label: 'Croissant' },
                { value: 'desc', label: 'Décroissant' }
              ]}
              placeholder="Ordre"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {totalItems} article{totalItems !== 1 ? 's' : ''} trouvé{totalItems !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : articles.length > 0 ? (
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
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
          <p className="text-gray-500">
            {searchTerm ? 
              `Aucun article ne correspond à votre recherche "${searchTerm}".` :
              "Commencez par ajouter des articles à votre stock."
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        limit={limit}
      />

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
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_demande');
  const [sortOrder, setSortOrder] = useState('desc');
  const limit = 10;
  
  const [formData, setFormData] = useState({
    article_id: '',
    quantite_demandee: ''
  });

  useEffect(() => {
    fetchDemandes();
    fetchArticles();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchDemandes();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API}/demandes?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDemandes(response.data.items);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Error fetching demandes:', error);
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/articles?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(response.data.items || response.data);
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

const MouvementsList = ({ user }) => {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMouvements();
  }, []);

  const fetchMouvements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/mouvements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMouvements(response.data);
    } catch (error) {
      console.error('Error fetching mouvements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mouvements de Stock</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total: {mouvements.length} mouvements</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mouvements.map((mouvement, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(mouvement.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {mouvement.article_nom || 'Article supprimé'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      mouvement.type === 'entree' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mouvement.type === 'entree' ? '⬇️ Entrée' : '⬆️ Sortie'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-medium ${
                      mouvement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mouvement.type === 'entree' ? '+' : '-'}{mouvement.quantite}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mouvement.user_nom || 'Utilisateur supprimé'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mouvement.raison}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mouvements.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun mouvement</h3>
              <p className="text-gray-500">Les mouvements de stock apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RapportsList = ({ user }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/dashboard/charts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rapports & Analyses</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📊 Exporter PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            📈 Exporter Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles par catégorie */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Articles par Catégorie
          </h3>
          <div className="space-y-3">
            {chartData?.articles_by_category && Object.entries(chartData.articles_by_category).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="font-medium">Catégorie {category}</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demandes par statut */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Demandes par Statut
          </h3>
          <div className="space-y-3">
            {chartData?.demandes_by_status && Object.entries(chartData.demandes_by_status).map(([status, count]) => {
              const colors = {
                pending: 'bg-yellow-500',
                approved: 'bg-green-500',
                rejected: 'bg-red-500'
              };
              const labels = {
                pending: 'En attente',
                approved: 'Approuvées',
                rejected: 'Rejetées'
              };
              
              return (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 ${colors[status]} rounded mr-3`}></div>
                    <span className="font-medium">{labels[status]}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Niveaux de stock */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">📦</span>
          Niveaux de Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData?.stock_levels?.map((article, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">{article.nom}</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stock actuel:</span>
                <span className={`font-bold ${
                  article.quantite <= article.quantite_min ? 'text-red-600' : 'text-green-600'
                }`}>
                  {article.quantite}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Minimum:</span>
                <span className="font-medium">{article.quantite_min}</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      article.quantite <= article.quantite_min ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((article.quantite / (article.quantite_min * 2)) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé des performances */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Résumé des Performances
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {chartData?.articles_by_category ? Object.values(chartData.articles_by_category).reduce((a, b) => a + b, 0) : 0}
            </div>
            <p className="text-gray-600">Articles totaux</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {chartData?.demandes_by_status?.approved || 0}
            </div>
            <p className="text-gray-600">Demandes approuvées</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {chartData?.demandes_by_status?.pending || 0}
            </div>
            <p className="text-gray-600">En attente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Rechercher..." }) => (
  <div className="relative flex-1 max-w-md">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder={placeholder}
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

// Filter Component
const FilterSelect = ({ value, onChange, options, placeholder, className = "" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, limit }) => {
  const startItem = ((currentPage - 1) * limit) + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 4, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{startItem}</span> à{' '}
            <span className="font-medium">{endItem}</span> sur{' '}
            <span className="font-medium">{totalItems}</span> résultats
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {generatePageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ user, onLogout, onToggleSidebar, sidebarOpen }) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {sidebarOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
              <span className="text-2xl font-bold text-blue-600">📦</span>
              <span className="ml-2 text-xl font-bold text-gray-800 hidden sm:block">Stockify</span>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <span className="sr-only">Notifications</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 7v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c1.1 0 2-.9 2-2s.9-2 2-2h10c1.1 0 2 .9 2 2s-.9 2-2 2z" />
              </svg>
            </button>
            
            {/* User menu */}
            <div className="relative flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{user?.nom}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.nom?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Déconnexion"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, user, isOpen, onClose }) => {
  const adminTabs = [
    { id: 'dashboard', name: 'Tableau de bord', icon: '📊', description: 'Vue d\'ensemble' },
    { id: 'articles', name: 'Articles', icon: '📦', description: 'Gestion du stock' },
    { id: 'demandes', name: 'Demandes', icon: '📋', description: 'Approbations' },
    { id: 'mouvements', name: 'Mouvements', icon: '📈', description: 'Historique' },
    { id: 'rapports', name: 'Rapports', icon: '📊', description: 'Analyses' },
  ];

  const userTabs = [
    { id: 'dashboard', name: 'Tableau de bord', icon: '📊', description: 'Vue d\'ensemble' },
    { id: 'articles', name: 'Articles', icon: '📦', description: 'Catalogue' },
    { id: 'demandes', name: 'Mes Demandes', icon: '📋', description: 'Mes requêtes' },
  ];

  const tabs = user?.role === 'admin' ? adminTabs : userTabs;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-16 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-25 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
          </div>
          
          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onClose(); // Close mobile menu on selection
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{tab.name}</p>
                  <p className={`text-xs mt-0.5 ${
                    activeTab === tab.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {tab.description}
                  </p>
                </div>
                {activeTab === tab.id && (
                  <div className="w-1 h-8 bg-blue-200 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">
                  {user?.nom?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.nom}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className={`h-3 w-3 rounded-full ${
                user?.role === 'admin' ? 'bg-green-400' : 'bg-blue-400'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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
      case 'mouvements':
        return <MouvementsList user={user} />;
      case 'rapports':
        return <RapportsList user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      
      {/* Main Content */}
      <div className="md:ml-64 pt-16">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;