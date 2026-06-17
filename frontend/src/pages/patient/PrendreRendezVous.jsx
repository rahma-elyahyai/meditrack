import { useState, useEffect } from 'react';
import { getMedecins, prendreRendezVous } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaUserMd, FaCalendarAlt, FaClock } from 'react-icons/fa';

const HEURES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
                '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

function PrendreRendezVous() {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    medecin_id: '', date: '', heure: '', motif: ''
  });

  useEffect(() => {
    getMedecins().then(res => setMedecins(res.data.medecins || res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await prendreRendezVous(form);
      navigate('/patient/rendezvous', { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la prise de rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  // Min date = aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarPlus className="text-blue-600" /> Prendre un rendez-vous
          </h2>
          <p className="text-gray-400 text-sm mt-1">Choisissez un médecin, une date et un créneau</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            ❌ {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Médecin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaUserMd className="text-blue-500" /> Médecin
            </label>
            <select
              name="medecin_id"
              value={form.medecin_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choisir un médecin --</option>
              {medecins.map(m => (
                <option key={m._id} value={m._id}>
                  Dr. {m.prenom} {m.nom}{m.specialite ? ` — ${m.specialite}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="text-blue-500" /> Date
            </label>
            <input
              type="date"
              name="date"
              min={today}
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Heure */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaClock className="text-blue-500" /> Créneau horaire
            </label>
            <div className="grid grid-cols-4 gap-2">
              {HEURES.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setForm({ ...form, heure: h })}
                  className={`py-2 rounded-xl text-sm font-medium border transition ${
                    form.heure === h
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Motif */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              📝 Motif de consultation <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              name="motif"
              value={form.motif}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez brièvement la raison de votre visite..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/patient/rendezvous')}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.medecin_id || !form.date || !form.heure || loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-medium transition"
            >
              {loading ? 'Envoi...' : 'Confirmer le rendez-vous'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrendreRendezVous;