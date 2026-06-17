import { useEffect, useState } from 'react';
import { getOrdonnances, supprimerOrdonnance } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus, FaSearch, FaTrash, FaEye,
  FaFileMedical, FaPrint, FaFilter
} from 'react-icons/fa';

function Ordonnances() {
  const [ordonnances, setOrdonnances] = useState([]);
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getOrdonnances();
      setOrdonnances(res.data.ordonnances);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const supprimer = async (id) => {
    if (window.confirm('Annuler cette ordonnance ?')) {
      await supprimerOrdonnance(id);
      charger();
    }
  };

  const filtrees = ordonnances.filter(o => {
    const matchSearch =
      o.patient_id?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      o.patient_id?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      o.medicaments?.some(m => m.nom.toLowerCase().includes(search.toLowerCase()));
    const matchFiltre = filtre === 'tous' || o.statut === filtre;
    return matchSearch && matchFiltre;
  });

  const statutStyle = (statut) => {
    switch (statut) {
      case 'active':   return 'bg-green-50 text-green-600 border border-green-200';
      case 'expirée':  return 'bg-gray-100 text-gray-500 border border-gray-200';
      case 'annulée':  return 'bg-red-50 text-red-500 border border-red-200';
      default:         return 'bg-gray-100 text-gray-400';
    }
  };

  const statutLabel = (statut) => {
    switch (statut) {
      case 'active':  return '✅ Active';
      case 'expirée': return '⏰ Expirée';
      case 'annulée': return '❌ Annulée';
      default:        return statut;
    }
  };

  const stats = [
    { label: 'Total', value: ordonnances.length, color: 'bg-blue-50 text-blue-600', icon: '📋' },
    { label: 'Actives', value: ordonnances.filter(o => o.statut === 'active').length, color: 'bg-green-50 text-green-600', icon: '✅' },
    { label: 'Expirées', value: ordonnances.filter(o => o.statut === 'expirée').length, color: 'bg-gray-100 text-gray-500', icon: '⏰' },
    { label: 'Annulées', value: ordonnances.filter(o => o.statut === 'annulée').length, color: 'bg-red-50 text-red-500', icon: '❌' },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileMedical className="text-blue-600" /> Ordonnances
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {ordonnances.length} ordonnance(s) enregistrée(s)
          </p>
        </div>
        <button
          onClick={() => navigate('/ordonnances/ajouter')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
        >
          <FaPlus /> Nouvelle ordonnance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${s.color}`}>
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
            placeholder="Rechercher par patient ou médicament..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400 text-sm" />
          {['tous', 'active', 'expirée', 'annulée'].map(f => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                filtre === f
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Liste en cartes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-sm">Chargement...</p>
        </div>
      ) : filtrees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
          <FaFileMedical className="text-5xl" />
          <p className="text-sm text-gray-400">Aucune ordonnance trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrees.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                    {o.patient_id?.prenom?.[0]}{o.patient_id?.nom?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {o.patient_id?.prenom} {o.patient_id?.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      Dr. {o.medecin_id?.prenom} {o.medecin_id?.nom}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutStyle(o.statut)}`}>
                  {statutLabel(o.statut)}
                </span>
              </div>

              {/* Médicaments */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  💊 Médicaments ({o.medicaments?.length})
                </p>
                <div className="space-y-2">
                  {o.medicaments?.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{m.nom}</p>
                        <p className="text-xs text-gray-400">
                          {m.dosage} — {m.frequence} — {m.duree}
                        </p>
                      </div>
                    </div>
                  ))}
                  {o.medicaments?.length > 3 && (
                    <p className="text-xs text-blue-500 pl-2">
                      +{o.medicaments.length - 3} autre(s) médicament(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  📅 {new Date(o.date).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/ordonnances/${o._id}`)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Voir"
                  >
                    <FaEye size={14} />
                  </button>
                  
                  <button
                    onClick={() => supprimer(o._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Annuler"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Ordonnances;