import { useEffect, useState } from 'react';
import { getRendezVousByPatient } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaPlus, FaClock, FaUserMd, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

function MesRendezVous() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await getRendezVousByPatient();
        setRdvs(res.data.rendezVous);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const statutStyle = (statut) => ({
    'confirmé':  'bg-green-50 text-green-600 border border-green-200',
    'planifié':'bg-yellow-50 text-yellow-600 border border-yellow-200',
    'annulé':    'bg-red-50 text-red-500 border border-red-200',
    'terminé':   'bg-gray-100 text-gray-500 border border-gray-200',
  }[statut] || 'bg-gray-100 text-gray-400');

  const statutIcon = (statut) => ({
    'confirmé':   <FaCheckCircle />,
    'planifié': <FaHourglassHalf />,
    'annulé':     <FaTimesCircle />,
    'terminé':    <FaCheckCircle />,
  }[statut] || null);

  const upcoming = rdvs.filter(r => new Date(r.date) >= new Date() && r.statut !== 'annulé');
  const past     = rdvs.filter(r => new Date(r.date) <  new Date() || r.statut === 'annulé');

  const RdvCard = ({ r }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <FaUserMd />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              Dr. {r.medecin_id?.prenom} {r.medecin_id?.nom}
            </p>
            <p className="text-xs text-gray-400">{r.medecin_id?.specialite || 'Médecin généraliste'}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statutStyle(r.statut)}`}>
          {statutIcon(r.statut)} {r.statut}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
        <span className="flex items-center gap-1">
          <FaCalendarAlt className="text-blue-400" />
          {new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1">
          <FaClock className="text-blue-400" /> {r.heure}
        </span>
      </div>
      {r.motif && (
        <p className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-3 py-2">
          📝 {r.motif}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" /> Mes Rendez-vous
          </h2>
          <p className="text-gray-400 text-sm mt-1">{rdvs.length} rendez-vous enregistré(s)</p>
        </div>
        <button
          onClick={() => navigate('/patient/rendezvous/prendre')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
        >
          <FaPlus /> Prendre un rendez-vous
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : rdvs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-300">
          <FaCalendarAlt className="text-5xl" />
          <p className="text-sm text-gray-400">Aucun rendez-vous pour le moment</p>
          <button
            onClick={() => navigate('/patient/rendezvous/prendre')}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm"
          >
            Prendre mon premier rendez-vous
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                📅 À venir ({upcoming.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcoming.map(r => <RdvCard key={r._id} r={r} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                🕐 Passés ({past.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-70">
                {past.map(r => <RdvCard key={r._id} r={r} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default MesRendezVous;