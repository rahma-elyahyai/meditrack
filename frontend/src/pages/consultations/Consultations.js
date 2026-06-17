import { useEffect, useState } from 'react';
import { getConsultations, supprimerConsultation } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus, FaSearch, FaEdit, FaTrash,
  FaEye, FaStethoscope, FaFilter
} from 'react-icons/fa';

function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getConsultations();
      setConsultations(res.data.consultations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const supprimer = async (id) => {
    if (window.confirm('Supprimer cette consultation ?')) {
      await supprimerConsultation(id);
      charger();
    }
  };

  const filtrees = consultations.filter(c => {
    const matchSearch =
      c.motif?.toLowerCase().includes(search.toLowerCase()) ||
      c.diagnostic?.toLowerCase().includes(search.toLowerCase()) ||
      c.patient_id?.nom?.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === 'tous' || c.statut === filtre;
    return matchSearch && matchFiltre;
  });

  const statutStyle = (statut) => {
    switch (statut) {
      case 'terminée':   return 'bg-green-50 text-green-600';
      case 'planifiée':  return 'bg-blue-50 text-blue-600';
      case 'en_cours':   return 'bg-yellow-50 text-yellow-600';
      case 'annulée':    return 'bg-red-50 text-red-600';
      default:           return 'bg-gray-100 text-gray-500';
    }
  };

  const statutLabel = (statut) => {
    switch (statut) {
      case 'terminée':  return '✅ Terminée';
      case 'planifiée': return '📅 Planifiée';
      case 'en_cours':  return '⏳ En cours';
      case 'annulée':   return '❌ Annulée';
      default:          return statut;
    }
  };

  const stats = [
    { label: 'Total', value: consultations.length, color: 'bg-blue-50 text-blue-600' },
    { label: 'Terminées', value: consultations.filter(c => c.statut === 'terminée').length, color: 'bg-green-50 text-green-600' },
    { label: 'Planifiées', value: consultations.filter(c => c.statut === 'planifiée').length, color: 'bg-purple-50 text-purple-600' },
    { label: 'En cours', value: consultations.filter(c => c.statut === 'en_cours').length, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaStethoscope className="text-blue-600" /> Consultations
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {consultations.length} consultation(s) enregistrée(s)
          </p>
        </div>
        <button
          onClick={() => navigate('/consultations/ajouter')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
        >
          <FaPlus /> Nouvelle consultation
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${s.color}`}>
              {s.value}
            </div>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Rechercher par motif, diagnostic ou patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400 text-sm" />
          {['tous', 'planifiée', 'en_cours', 'terminée', 'annulée'].map(f => (
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

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Patient</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Médecin</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Motif</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Diagnostic</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Date</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-500 uppercase text-xs tracking-wider">Statut</th>
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
            ) : filtrees.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <FaStethoscope className="text-5xl" />
                    <p className="text-sm text-gray-400">Aucune consultation trouvée</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrees.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-blue-50/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {c.patient_id?.prenom?.[0]}{c.patient_id?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {c.patient_id?.prenom} {c.patient_id?.nom}
                        </p>
                        <p className="text-xs text-gray-400">{c.patient_id?.numero_dossier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">
                      Dr. {c.medecin_id?.prenom} {c.medecin_id?.nom}
                    </p>
                    <p className="text-xs text-gray-400">{c.medecin_id?.specialite}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[150px] truncate">{c.motif}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-[150px] truncate">
                    {c.diagnostic || <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(c.date).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statutStyle(c.statut)}`}>
                      {statutLabel(c.statut)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/consultations/${c._id}`)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Voir détail"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => navigate(`/consultations/modifier/${c._id}`)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => supprimer(c._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Consultations;