import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/api';
import {
  FaUserInjured, FaStethoscope, FaCalendarAlt, FaFileMedical,
  FaArrowUp, FaUsers, FaCheckCircle, FaClock, FaPills
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const maintenant = new Date();
  const heure = maintenant.getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const graphData = data?.graphiques?.consultationsParMois?.map(d => ({
    mois: MOIS[d._id.mois - 1],
    total: d.total
  })) || [];

  const tempsRelatif = (date) => {
    const diff = (new Date() - new Date(date)) / 1000;
    if (diff < 60)    return 'À l\'instant';
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
  };

  const statutConsultStyle = (s) => {
    switch (s) {
      case 'terminée':  return 'bg-green-50 text-green-600';
      case 'planifiée': return 'bg-blue-50 text-blue-600';
      case 'en_cours':  return 'bg-yellow-50 text-yellow-600';
      case 'annulée':   return 'bg-red-50 text-red-500';
      default:          return 'bg-gray-100 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const s = data?.stats;
  const a = data?.activite;

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {salutation}, {user?.prenom} 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {/* RDV aujourd'hui badge */}
        {s?.rdvAujourdhui > 0 && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md shadow-blue-100 flex items-center gap-2">
            <FaCalendarAlt />
            {s.rdvAujourdhui} RDV aujourd'hui
          </div>
        )}
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaUserInjured className="text-blue-600 text-xl" />}
          title="Patients actifs"
          value={s?.totaux?.patients ?? '—'}
          badge={`+${s?.mois?.patients ?? 0} ce mois`}
          color="bg-blue-50"
          onClick={() => navigate('/patients')}
        />
        <StatCard
          icon={<FaStethoscope className="text-green-600 text-xl" />}
          title="Consultations"
          value={s?.totaux?.consultations ?? '—'}
          badge={`+${s?.mois?.consultations ?? 0} ce mois`}
          color="bg-green-50"
          onClick={() => navigate('/consultations')}
        />
        <StatCard
          icon={<FaCalendarAlt className="text-purple-600 text-xl" />}
          title="Rendez-vous"
          value={s?.totaux?.rdv ?? '—'}
          badge={`+${s?.mois?.rdv ?? 0} ce mois`}
          color="bg-purple-50"
          onClick={() => navigate('/rendezvous')}
        />
        <StatCard
          icon={<FaFileMedical className="text-orange-600 text-xl" />}
          title="Ordonnances"
          value={s?.totaux?.ordonnances ?? '—'}
          badge={`${s?.ordonnancesActives ?? 0} actives`}
          color="bg-orange-50"
          onClick={() => navigate('/ordonnances')}
        />
      </div>

      {/* Graphique + mini stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Graphique consultations par mois */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-800">📊 Consultations — 6 derniers mois</h3>
          </div>
          {graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={graphData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }}
                  cursor={{ fill: '#eff6ff' }}
                />
                <Bar dataKey="total" name="Consultations" radius={[6, 6, 0, 0]}>
                  {graphData.map((_, i) => (
                    <Cell key={i} fill={i === graphData.length - 1 ? '#2563eb' : '#bfdbfe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-300 text-sm">
              Pas encore de données
            </div>
          )}
        </div>

        {/* Mini stats détaillées */}
        <div className="space-y-4">
          {/* Consultations par statut */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaStethoscope className="text-green-500" /> Consultations
            </h4>
            <div className="space-y-2">
              <MiniStatRow label="Terminées" value={s?.consultations?.terminees} color="bg-green-400" />
              <MiniStatRow label="Planifiées" value={s?.consultations?.planifiees} color="bg-blue-400" />
              <MiniStatRow label="En cours" value={s?.consultations?.enCours} color="bg-yellow-400" />
            </div>
          </div>

          {/* RDV par statut */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-purple-500" /> Rendez-vous
            </h4>
            <div className="space-y-2">
              <MiniStatRow label="Planifiés"  value={s?.rdv?.planifies}  color="bg-blue-400" />
              <MiniStatRow label="Confirmés"  value={s?.rdv?.confirmes}  color="bg-green-400" />
              <MiniStatRow label="Annulés"    value={s?.rdv?.annules}    color="bg-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Dernières consultations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold text-gray-800">🩺 Dernières consultations</h3>
            <button onClick={() => navigate('/consultations')}
              className="text-xs text-blue-600 hover:underline">Voir tout →</button>
          </div>
          {a?.consultations?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune consultation</p>
          ) : (
            <div className="space-y-3">
              {a?.consultations?.map((c) => (
                <div key={c._id}
                  className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition"
                  onClick={() => navigate(`/consultations/${c._id}`)}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                    {c.patient_id?.prenom?.[0]}{c.patient_id?.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {c.patient_id?.prenom} {c.patient_id?.nom}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{c.motif}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statutConsultStyle(c.statut)}`}>
                    {c.statut}
                  </span>
                  <span className="text-xs text-gray-300 flex-shrink-0">{tempsRelatif(c.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers patients + RDV */}
        <div className="space-y-6">

          {/* Derniers patients */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FaUsers className="text-blue-400" /> Nouveaux patients
              </h3>
              <button onClick={() => navigate('/patients')}
                className="text-xs text-blue-600 hover:underline">Voir tout →</button>
            </div>
            {a?.patients?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun patient</p>
            ) : (
              <div className="space-y-3">
                {a?.patients?.map(p => (
                  <div key={p._id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition"
                    onClick={() => navigate(`/patients/${p._id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                      {p.prenom?.[0]}{p.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-blue-400 font-mono">{p.numero_dossier}</p>
                    </div>
                    <FaArrowUp className="text-gray-200 text-xs rotate-45 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prochains RDV */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FaClock className="text-purple-400" /> RDV récents
              </h3>
              <button onClick={() => navigate('/rendezvous')}
                className="text-xs text-blue-600 hover:underline">Voir tout →</button>
            </div>
            {a?.rdv?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun rendez-vous</p>
            ) : (
              <div className="space-y-3">
                {a?.rdv?.map(r => (
                  <div key={r._id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {r.patient_id?.prenom} {r.patient_id?.nom}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })} à {r.heure}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, badge, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-100 transition group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {badge && (
          <p className="text-xs text-green-500 font-medium mt-0.5 flex items-center gap-1">
            <FaArrowUp className="text-[10px]" /> {badge}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniStatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-700">{value ?? 0}</span>
    </div>
  );
}

export default Dashboard;