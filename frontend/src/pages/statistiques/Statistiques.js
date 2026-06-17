import { useEffect, useState } from 'react';
import { getStats } from '../../api/api';
import {
  FaChartBar, FaUserInjured, FaStethoscope,
  FaFileMedical, FaCalendarAlt
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
              'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const COLORS_PIE  = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6'];
const COLORS_ROLE = {
  terminée:  '#10b981',
  planifiée: '#3b82f6',
  en_cours:  '#f59e0b',
  annulée:   '#ef4444'
};

function StatCard({ icon, title, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name} : <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Statistiques() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('mois');

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data.stats))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-400 text-sm">Chargement des statistiques...</p>
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400">
      Impossible de charger les statistiques
    </div>
  );

  // Préparer données graphiques
  const consultationsParMois = (stats.consultationsParMois || []).map(c => ({
    name: MOIS[(c._id.mois || 1) - 1],
    Consultations: c.total
  }));

  const patientsParSexe = (stats.patientsParSexe || []).map(p => ({
    name: p._id === 'M' ? 'Hommes' : p._id === 'F' ? 'Femmes' : p._id,
    value: p.total
  }));

  const consultationsParStatut = (stats.consultationsParStatut || []).map(c => ({
    name: c._id,
    value: c.total,
    color: COLORS_ROLE[c._id] || '#6b7280'
  }));

  // Données simulées enrichies pour les graphiques
  const tendanceSemaine = [
    { name: 'Lun', Consultations: 8, Patients: 5, RDV: 10 },
    { name: 'Mar', Consultations: 12, Patients: 8, RDV: 14 },
    { name: 'Mer', Consultations: 6, Patients: 4, RDV: 8 },
    { name: 'Jeu', Consultations: 15, Patients: 10, RDV: 18 },
    { name: 'Ven', Consultations: 10, Patients: 7, RDV: 12 },
    { name: 'Sam', Consultations: 4, Patients: 3, RDV: 5 },
  ];

  const topMaladies = [
    { name: 'Hypertension', total: 42 },
    { name: 'Diabète', total: 38 },
    { name: 'Grippe', total: 31 },
    { name: 'Gastrite', total: 24 },
    { name: 'Asthme', total: 19 },
  ];

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartBar className="text-blue-600" /> Statistiques
          </h2>
          <p className="text-gray-400 text-sm mt-1">Vue d'ensemble de l'activité médicale</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
          {['semaine', 'mois', 'année'].map(p => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                periode === p
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FaUserInjured className="text-blue-600" />}
          title="Total Patients"
          value={stats.totalPatients}
          sub="Patients enregistrés"
          color="bg-blue-50"
        />
        <StatCard
          icon={<FaStethoscope className="text-green-600" />}
          title="Consultations"
          value={stats.totalConsultations}
          sub="Toutes périodes"
          color="bg-green-50"
        />
        <StatCard
          icon={<FaFileMedical className="text-orange-500" />}
          title="Ordonnances"
          value={stats.totalOrdonnances}
          sub="Prescriptions émises"
          color="bg-orange-50"
        />
        <StatCard
          icon={<FaCalendarAlt className="text-purple-600" />}
          title="Rendez-vous"
          value={stats.totalRendezVous}
          sub="Planifiés & confirmés"
          color="bg-purple-50"
        />
      </div>

      {/* Graphiques ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Activité de la semaine — Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-800">Activité de la semaine</h3>
              <p className="text-xs text-gray-400 mt-0.5">Consultations, patients et RDV</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-blue-500 rounded inline-block"></span>Consultations</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-green-400 rounded inline-block"></span>Patients</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-purple-400 rounded inline-block"></span>RDV</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tendanceSemaine}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Consultations" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGrad)" />
              <Area type="monotone" dataKey="Patients" stroke="#10b981" strokeWidth={2} fill="url(#greenGrad)" />
              <Area type="monotone" dataKey="RDV" stroke="#8b5cf6" strokeWidth={2} fill="url(#purpleGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Patients par sexe — Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800">Patients par sexe</h3>
            <p className="text-xs text-gray-400 mt-0.5">Répartition globale</p>
          </div>
          {patientsParSexe.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <FaUserInjured className="text-4xl mb-2" />
              <p className="text-sm">Aucune donnée</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={patientsParSexe}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {patientsParSexe.map((_, i) => (
                      <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {patientsParSexe.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_PIE[i] }}></div>
                      <span className="text-gray-600">{p.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Graphiques ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Consultations par mois — Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800">Consultations par mois</h3>
            <p className="text-xs text-gray-400 mt-0.5">Historique des 6 derniers mois</p>
          </div>
          {consultationsParMois.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <FaChartBar className="text-4xl mb-2" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={consultationsParMois} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Consultations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Statut des consultations — Pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800">Statut consultations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Répartition par statut</p>
          </div>
          {consultationsParStatut.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <FaStethoscope className="text-4xl mb-2" />
              <p className="text-sm">Aucune donnée</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={consultationsParStatut}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {consultationsParStatut.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {consultationsParStatut.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                      <span className="text-gray-600 capitalize">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top maladies */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800">Top 5 — Diagnostics fréquents</h3>
          <p className="text-xs text-gray-400 mt-0.5">Maladies les plus diagnostiquées</p>
        </div>
        <div className="space-y-4">
          {topMaladies.map((m, i) => {
            const max = topMaladies[0].total;
            const pct = Math.round((m.total / max) * 100);
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-400', 'bg-red-400'];
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{m.name}</span>
                    <span className="text-gray-400">{m.total} cas</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[i]} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500 w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Statistiques;