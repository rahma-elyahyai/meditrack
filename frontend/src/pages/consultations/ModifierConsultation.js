import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API, { getPatients } from '../../api/api';
import { FaArrowLeft, FaSave, FaStethoscope, FaHeartbeat } from 'react-icons/fa';

function ModifierConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    patient_id: '',
    motif: '',
    diagnostic: '',
    symptomes: '',
    traitement: '',
    notes: '',
    statut: 'terminée',
    prochain_rdv: '',
    examen_clinique: {
      tension: '',
      temperature: '',
      poids: '',
      taille: '',
      frequence_cardiaque: ''
    }
  });

  useEffect(() => {
    getPatients().then(res => setPatients(res.data.patients));

    API.get(`/consultations/${id}`)
      .then(res => {
        const c = res.data.consultation;
        setForm({
          patient_id: c.patient_id?._id || c.patient_id || '',
          motif: c.motif || '',
          diagnostic: c.diagnostic || '',
          symptomes: c.symptomes?.join(', ') || '',
          traitement: c.traitement || '',
          notes: c.notes || '',
          statut: c.statut || 'terminée',
          prochain_rdv: c.prochain_rdv
            ? new Date(c.prochain_rdv).toISOString().split('T')[0]
            : '',
          examen_clinique: {
            tension: c.examen_clinique?.tension || '',
            temperature: c.examen_clinique?.temperature || '',
            poids: c.examen_clinique?.poids || '',
            taille: c.examen_clinique?.taille || '',
            frequence_cardiaque: c.examen_clinique?.frequence_cardiaque || ''
          }
        });
      })
      .catch(() => setErreur('Impossible de charger la consultation'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleExamen = (e) => setForm({
    ...form,
    examen_clinique: { ...form.examen_clinique, [e.target.name]: e.target.value }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.motif) return setErreur('Le motif est obligatoire');
    setLoadingForm(true);
    setErreur('');
    try {
      const body = { ...form };

      // Convert symptomes string to array
      body.symptomes = form.symptomes
        ? form.symptomes.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      // Clean empty optional fields
      ['prochain_rdv', 'diagnostic', 'traitement', 'notes'].forEach(field => {
        if (body[field] === '') delete body[field];
      });

      // Clean empty examen_clinique numbers
      const ec = { ...body.examen_clinique };
      ['temperature', 'poids', 'taille', 'frequence_cardiaque'].forEach(f => {
        if (ec[f] === '' || ec[f] === null) delete ec[f];
      });
      body.examen_clinique = ec;

      await API.put(`/consultations/${id}`, body);
      setSucces(true);
      setTimeout(() => navigate(`/consultations/${id}`), 1200);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoadingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`/consultations/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaStethoscope className="text-blue-600" /> Modifier la consultation
          </h2>
          <p className="text-gray-400 text-sm mt-1">Modifiez les informations de la consultation</p>
        </div>
      </div>

      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">⚠️ {erreur}</div>
      )}
      {succes && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6">✅ Consultation modifiée ! Redirection...</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Patient + Motif */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">👤 Patient & Motif</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- Sélectionner un patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.prenom} {p.nom} — {p.numero_dossier}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
                <input
                  name="motif"
                  value={form.motif}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="terminée">✅ Terminée</option>
                  <option value="planifiée">📅 Planifiée</option>
                  <option value="en_cours">⏳ En cours</option>
                  <option value="annulée">❌ Annulée</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptômes <span className="text-gray-400 text-xs">(séparés par des virgules)</span>
              </label>
              <input
                name="symptomes"
                value={form.symptomes}
                onChange={handleChange}
                placeholder="Ex: nausées, fièvre, fatigue"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Examen clinique */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FaHeartbeat className="text-red-400" /> Examen clinique
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'tension', label: '❤️ Tension', placeholder: '12/8', unit: 'cmHg', type: 'text' },
              { name: 'temperature', label: '🌡️ Température', placeholder: '37.5', unit: '°C', type: 'number' },
              { name: 'poids', label: '⚖️ Poids', placeholder: '70', unit: 'kg', type: 'number' },
              { name: 'taille', label: '📏 Taille', placeholder: '175', unit: 'cm', type: 'number' },
              { name: 'frequence_cardiaque', label: '💓 Fréq. card.', placeholder: '72', unit: 'bpm', type: 'number' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  step={f.type === 'number' ? '0.1' : undefined}
                  value={form.examen_clinique[f.name]}
                  onChange={handleExamen}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">{f.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic + Traitement + Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">🔬 Diagnostic & Traitement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnostic</label>
              <textarea
                name="diagnostic"
                value={form.diagnostic}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Traitement prescrit</label>
              <textarea
                name="traitement"
                value={form.traitement}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prochain rendez-vous</label>
              <input
                type="date"
                name="prochain_rdv"
                value={form.prochain_rdv}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-between">
          <button type="button" onClick={() => navigate(`/consultations/${id}`)}
            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition">
            Annuler
          </button>
          <button type="submit" disabled={loadingForm || succes}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition shadow-md shadow-blue-100 disabled:opacity-60">
            <FaSave />
            {loadingForm ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModifierConsultation;