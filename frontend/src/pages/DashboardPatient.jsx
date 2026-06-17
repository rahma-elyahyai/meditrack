import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRendezVousByPatient } from '../api/api';
import {
  FaCalendarAlt, FaPlus, FaClock, FaUserMd,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaFileMedical, FaHeartbeat
} from 'react-icons/fa';

function DashboardPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRendezVousByPatient()
      .then(res => setRdvs(res.data.rendezVous || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const prochainRdv = rdvs
    .filter(r => new Date(r.date) >= new Date() && r.statut !== 'annulé')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const stats = [
    {
      label: 'Total RDV',
      value: rdvs.length,
      icon: '📋',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'À venir',
      value: rdvs.filter(r => new Date(r.date) >= new Date() && r.statut !== 'annulé').length,
      icon: '📅',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Confirmés',
      value: rdvs.filter(r => r.statut === 'confirmé').length,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Annulés',
      value: rdvs.filter(r => r.statut === 'annulé').length,
      icon: '❌',
      color: 'bg-red-50 text-red-500',
    },
  ];

  const statutStyle = (statut) => ({
    'confirmé':   'bg-green-50 text-green-600 border border-green-200',
    'planifié': 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    'annulé':     'bg-red-50 text-red-500 border border-red-200',
    'terminé':    'bg-gray-100 text-gray-500 border border-gray-200',
  }[statut] || 'bg-gray-100 text-gray-400');

  const statutIcon = (statut) => ({
    'confirmé':   <FaCheckCircle />,
    'planifié': <FaHourglassHalf />,
    'annulé':     <FaTimesCircle />,
    'terminé':    <FaCheckCircle />,
  }[statut]);

  const rdvsAVenir = rdvs
    .filter(r => new Date(r.date) >= new Date() && r.statut !== 'annulé')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const rdvsRecents = rdvs
    .filter(r => new Date(r.date) < new Date() || r.statut === 'annulé')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {salutation}, {user?.prenom} 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <button
          onClick={() => navigate('/patient/rendezvous/prendre')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
        >
          <FaPlus /> Prendre un rendez-vous
        </button>
      </div>

      {/* Prochain RDV — bannière */}
      {prochainRdv ? (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">
                🗓 Prochain rendez-vous
              </p>
              <p className="text-xl font-bold mb-1">
                Dr. {prochainRdv.medecin_id?.prenom} {prochainRdv.medecin_id?.nom}
              </p>
              <p className="text-blue-100 text-sm">
                {prochainRdv.medecin_id?.specialite || 'Médecin généraliste'}
              </p>
            </div>
            <div className="bg-white/20 rounded-xl px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">
                {new Date(prochainRdv.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </p>
              <p className="text-blue-100 text-sm flex items-center gap-1 justify-center mt-1">
                <FaClock size={11} /> {prochainRdv.heure}
              </p>
            </div>
          </div>
          {prochainRdv.motif && (
            <p className="text-blue-100 text-sm mt-4 bg-white/10 rounded-lg px-4 py-2">
              📝 {prochainRdv.motif}
            </p>
          )}
        </div>
      ) : (
        <div
          onClick={() => navigate('/patient/rendezvous/prendre')}
          className="border-2 border-dashed border-blue-200 rounded-2xl p-6 mb-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <FaCalendarAlt className="text-blue-300 text-3xl mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">Aucun rendez-vous à venir</p>
          <p className="text-blue-500 text-sm mt-1 underline">Prendre un rendez-vous →</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
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

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RDV à venir */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Rendez-vous à venir
            </h3>
            <button
              onClick={() => navigate('/patient/rendezvous')}
              className="text-xs text-blue-600 hover:underline"
            >
              Voir tout →
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : rdvsAVenir.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucun rendez-vous à venir</p>
              <button
                onClick={() => navigate('/patient/rendezvous/prendre')}
                className="mt-3 text-sm text-blue-600 underline"
              >
                Prendre un rendez-vous
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rdvsAVenir.map(r => (
                <div key={r._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => navigate('/patient/rendezvous')}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FaUserMd size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Dr. {r.medecin_id?.prenom} {r.medecin_id?.nom}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <FaCalendarAlt size={10} />
                      {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                      <FaClock size={10} /> {r.heure}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statutStyle(r.statut)}`}>
                    {statutIcon(r.statut)} {r.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique récent */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-purple-500" /> Historique récent
            </h3>
            <button
              onClick={() => navigate('/patient/rendezvous')}
              className="text-xs text-blue-600 hover:underline"
            >
              Voir tout →
            </button>
          </div>

          {rdvsRecents.length === 0 ? (
            <div className="text-center py-8">
              <FaFileMedical className="text-gray-200 text-4xl mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucun historique pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rdvsRecents.map(r => (
                <div key={r._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <FaHeartbeat size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Dr. {r.medecin_id?.prenom} {r.medecin_id?.nom}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      {r.motif && ` — ${r.motif}`}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statutStyle(r.statut)}`}>
                    {statutIcon(r.statut)} {r.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">⚡ Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/patient/rendezvous/prendre')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-600 transition">
              <FaPlus />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Prendre un rendez-vous</p>
              <p className="text-xs text-gray-400">Choisir un médecin et un créneau</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/patient/rendezvous')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-100 hover:border-purple-400 hover:bg-purple-50 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-600 transition">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Mes rendez-vous</p>
              <p className="text-xs text-gray-400">Consulter tout mon historique</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPatient;