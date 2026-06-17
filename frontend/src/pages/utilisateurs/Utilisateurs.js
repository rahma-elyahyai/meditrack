import { useEffect, useState } from 'react';
import {
  FaUsers, FaPlus, FaSearch, FaTrash,
  FaEdit, FaTimes, FaUserMd, FaUserNurse,
  FaUserInjured, FaUserShield
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filtreRole, setFiltreRole] = useState('tous');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userSelectionne, setUserSelectionne] = useState(null);
  const [erreur, setErreur] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', role: 'medecin',
    telephone: ''
  });

  const token = localStorage.getItem('token');

  const charger = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/auth/users`, {  // was /auth/register
          headers: { Authorization: `Bearer ${token}` }
    }
);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setErreur('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false);
      setForm({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'medecin', telephone: '' });
      charger();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setErreur('');
    try {
      const res = await fetch(`${API_URL}/auth/users/${userSelectionne._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nom: userSelectionne.nom,
          prenom: userSelectionne.prenom,
          telephone: userSelectionne.telephone,
          role: userSelectionne.role,
          actif: userSelectionne.actif
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowEditModal(false);
      charger();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;
    try {
      await fetch(`${API_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      charger();
    } catch (err) {
      console.error(err);
    }
  };

  const filtres = users.filter(u => {
    const matchSearch =
      u.nom?.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filtreRole === 'tous' || u.role === filtreRole;
    return matchSearch && matchRole;
  });

  const roleInfo = (role) => {
    switch (role) {
      case 'admin':      return { label: 'Admin',      color: 'bg-purple-50 text-purple-600', icon: <FaUserShield /> };
      case 'medecin':    return { label: 'Médecin',    color: 'bg-blue-50 text-blue-600',     icon: <FaUserMd /> };
      case 'secretaire': return { label: 'Secrétaire', color: 'bg-orange-50 text-orange-500', icon: <FaUserNurse /> };
      case 'patient':    return { label: 'Patient',    color: 'bg-green-50 text-green-600',   icon: <FaUserInjured /> };
      default:           return { label: role,         color: 'bg-gray-100 text-gray-500',    icon: null };
    }
  };

  const stats = [
    { label: 'Total',       value: users.length,                                    color: 'bg-blue-50 text-blue-600',     icon: '👥' },
    { label: 'Médecins',    value: users.filter(u => u.role === 'medecin').length,   color: 'bg-blue-50 text-blue-700',     icon: '🩺' },
    { label: 'Secrétaires', value: users.filter(u => u.role === 'secretaire').length,color: 'bg-orange-50 text-orange-500', icon: '📋' },
    { label: 'Patients',    value: users.filter(u => u.role === 'patient').length,   color: 'bg-green-50 text-green-600',   icon: '🏥' },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-blue-600" /> Utilisateurs
          </h2>
          <p className="text-gray-400 text-sm mt-1">{users.length} utilisateur(s) enregistré(s)</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErreur(''); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
        >
          <FaPlus /> Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recherche + Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['tous', 'admin', 'medecin', 'secretaire', 'patient'].map(r => (
            <button
              key={r}
              onClick={() => setFiltreRole(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                filtreRole === r
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Utilisateur</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Email</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Téléphone</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Rôle</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Statut</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Créé le</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-sm">Chargement...</p>
                  </div>
                </td>
              </tr>
            ) : filtres.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <FaUsers className="text-5xl" />
                    <p className="text-sm text-gray-400">Aucun utilisateur trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtres.map((u) => {
                const r = roleInfo(u.role);
                return (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-gray-400">ID: {u._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-500">{u.telephone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-medium ${r.color}`}>
                        {r.icon} {r.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.actif
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-400'
                      }`}>
                        {u.actif ? '● Actif' : '● Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setUserSelectionne({ ...u }); setShowEditModal(true); setErreur(''); }}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => supprimer(u._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ═══ MODAL Ajouter Utilisateur ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">➕ Nouvel utilisateur</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  ⚠️ {erreur}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Prénom"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Nom"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@meditrack.ma"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input
                  type="password"
                  value={form.mot_de_passe}
                  onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="06XXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="medecin">🩺 Médecin</option>
                  <option value="secretaire">📋 Secrétaire</option>
                  <option value="patient">🏥 Patient</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition disabled:opacity-60"
                >
                  {loadingForm ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL Modifier Utilisateur ═══ */}
      {showEditModal && userSelectionne && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">✏️ Modifier utilisateur</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {erreur && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  ⚠️ {erreur}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    value={userSelectionne.prenom}
                    onChange={(e) => setUserSelectionne({ ...userSelectionne, prenom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    value={userSelectionne.nom}
                    onChange={(e) => setUserSelectionne({ ...userSelectionne, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  value={userSelectionne.telephone || ''}
                  onChange={(e) => setUserSelectionne({ ...userSelectionne, telephone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={userSelectionne.role}
                  onChange={(e) => setUserSelectionne({ ...userSelectionne, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="medecin">🩺 Médecin</option>
                  <option value="secretaire">📋 Secrétaire</option>
                  <option value="patient">🏥 Patient</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={userSelectionne.actif}
                  onChange={(e) => setUserSelectionne({ ...userSelectionne, actif: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="true">● Actif</option>
                  <option value="false">● Inactif</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition disabled:opacity-60"
                >
                  {loadingForm ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Utilisateurs;