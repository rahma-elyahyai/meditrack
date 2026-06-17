import { useState, useEffect } from 'react';
import { ajouterConsultation, getPatients } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaStethoscope, FaUserInjured, FaThermometerHalf,
  FaHeartbeat, FaWeight, FaSave, FaArrowLeft
} from 'react-icons/fa';

function AjouterConsultation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [etape, setEtape] = useState(1);

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
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExamen = (e) => {
    setForm({
      ...form,
      examen_clinique: {
        ...form.examen_clinique,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id) return setErreur('Veuillez sélectionner un patient');
    if (!form.motif) return setErreur('Le motif est obligatoire');

    setLoading(true);
    setErreur('');
    try {
      const data = {
        ...form,
       // medecin_id: user.id,
        symptomes: form.symptomes
          ? form.symptomes.split(',').map(s => s.trim())
          : []
      };
      await ajouterConsultation(data);
      navigate('/consultations');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const patientSelectionne = patients.find(p => p._id === form.patient_id);

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/consultations')}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaStethoscope className="text-blue-600" /> Nouvelle Consultation
          </h2>
          <p className="text-gray-400 text-sm mt-1">Remplissez les informations de la consultation</p>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-0 mb-8">
        {[
          { n: 1, label: 'Patient' },
          { n: 2, label: 'Examen clinique' },
          { n: 3, label: 'Diagnostic' },
        ].map((e, i) => (
          <div key={e.n} className="flex items-center">
            <button
              onClick={() => setEtape(e.n)}
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                etape === e.n
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : etape > e.n
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {etape > e.n ? '✓' : e.n}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                etape === e.n ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {e.label}
              </span>
            </button>
            {i < 2 && (
              <div className={`w-16 h-0.5 mx-2 ${etape > e.n ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Erreur */}
      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          ⚠️ {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ═══ ÉTAPE 1 — Sélection patient ═══ */}
        {etape === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUserInjured className="text-blue-500" /> Sélection du patient
              </h3>

              {/* Dropdown patient */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span className="text-red-500">*</span>
                </label>
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

              {/* Carte info patient */}
              {patientSelectionne && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Nom complet</p>
                    <p className="font-semibold text-gray-800">
                      {patientSelectionne.prenom} {patientSelectionne.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">N° Dossier</p>
                    <p className="font-semibold text-blue-600">{patientSelectionne.numero_dossier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Groupe sanguin</p>
                    <p className="font-semibold text-red-500">{patientSelectionne.groupe_sanguin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Allergies</p>
                    <p className="font-semibold text-orange-500">
                      {patientSelectionne.allergies?.join(', ') || 'Aucune'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Maladies chroniques</p>
                    <p className="font-semibold text-gray-700">
                      {patientSelectionne.maladies_chroniques?.join(', ') || 'Aucune'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Motif */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Motif de consultation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="motif"
                    value={form.motif}
                    onChange={handleChange}
                    placeholder="Ex: Douleurs abdominales, fièvre, contrôle..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptômes <span className="text-gray-400 text-xs">(séparés par des virgules)</span>
                  </label>
                  <input
                    name="symptomes"
                    value={form.symptomes}
                    onChange={handleChange}
                    placeholder="Ex: nausées, maux de tête, fatigue"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!form.patient_id || !form.motif) {
                    setErreur('Sélectionnez un patient et renseignez le motif');
                    return;
                  }
                  setErreur('');
                  setEtape(2);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition shadow-md shadow-blue-100"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 2 — Examen clinique ═══ */}
        {etape === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaHeartbeat className="text-red-500" /> Examen clinique
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Tension */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                    ❤️ Tension artérielle
                  </label>
                  <input
                    name="tension"
                    value={form.examen_clinique.tension}
                    onChange={handleExamen}
                    placeholder="Ex: 12/8"
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                  />
                  <p className="text-xs text-red-300 mt-1">cmHg</p>
                </div>

                {/* Température */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <label className="block text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
                    🌡️ Température
                  </label>
                  <input
                    name="temperature"
                    type="number"
                    step="0.1"
                    value={form.examen_clinique.temperature}
                    onChange={handleExamen}
                    placeholder="Ex: 37.5"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  />
                  <p className="text-xs text-orange-300 mt-1">°C</p>
                </div>

                {/* Poids */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <label className="block text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
                    ⚖️ Poids
                  </label>
                  <input
                    name="poids"
                    type="number"
                    value={form.examen_clinique.poids}
                    onChange={handleExamen}
                    placeholder="Ex: 70"
                    className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
                  />
                  <p className="text-xs text-green-300 mt-1">kg</p>
                </div>

                {/* Taille */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    📏 Taille
                  </label>
                  <input
                    name="taille"
                    type="number"
                    value={form.examen_clinique.taille}
                    onChange={handleExamen}
                    placeholder="Ex: 175"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                  <p className="text-xs text-blue-300 mt-1">cm</p>
                </div>

                {/* Fréquence cardiaque */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                    💓 Fréquence cardiaque
                  </label>
                  <input
                    name="frequence_cardiaque"
                    type="number"
                    value={form.examen_clinique.frequence_cardiaque}
                    onChange={handleExamen}
                    placeholder="Ex: 72"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                  <p className="text-xs text-purple-300 mt-1">bpm</p>
                </div>

                {/* IMC calculé automatiquement */}
                {form.examen_clinique.poids && form.examen_clinique.taille && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      📊 IMC (calculé)
                    </label>
                    <p className="text-2xl font-bold text-gray-700">
                      {(form.examen_clinique.poids /
                        Math.pow(form.examen_clinique.taille / 100, 2)).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">kg/m²</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setEtape(1)}
                className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
              >
                ← Précédent
              </button>
              <button
                type="button"
                onClick={() => setEtape(3)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition shadow-md shadow-blue-100"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ═══ ÉTAPE 3 — Diagnostic & traitement ═══ */}
        {etape === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaStethoscope className="text-blue-500" /> Diagnostic & Traitement
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic
                  </label>
                  <textarea
                    name="diagnostic"
                    value={form.diagnostic}
                    onChange={handleChange}
                    placeholder="Ex: Gastrite chronique, rhinopharyngite aiguë..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traitement prescrit
                  </label>
                  <textarea
                    name="traitement"
                    value={form.traitement}
                    onChange={handleChange}
                    placeholder="Ex: Oméprazole 20mg 1x/jour pendant 14 jours..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes du médecin
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Observations, recommandations particulières..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prochain rendez-vous
                  </label>
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

            {/* Résumé avant envoi */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-blue-700 mb-3">📋 Résumé de la consultation</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Patient :</span>{' '}
                  <span className="font-medium text-gray-700">
                    {patientSelectionne?.prenom} {patientSelectionne?.nom}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Motif :</span>{' '}
                  <span className="font-medium text-gray-700">{form.motif}</span>
                </div>
                <div>
                  <span className="text-gray-400">Statut :</span>{' '}
                  <span className="font-medium text-gray-700">{form.statut}</span>
                </div>
                <div>
                  <span className="text-gray-400">Diagnostic :</span>{' '}
                  <span className="font-medium text-gray-700">{form.diagnostic || '—'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setEtape(2)}
                className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
              >
                ← Précédent
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition shadow-md shadow-green-100 disabled:opacity-60"
              >
                <FaSave />
                {loading ? 'Enregistrement...' : 'Enregistrer la consultation'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AjouterConsultation;