import { useState, useEffect } from 'react';
import { ajouterOrdonnance, getPatients, getConsultations } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaFileMedical, FaPlus, FaTrash,
  FaSave, FaArrowLeft, FaPills
} from 'react-icons/fa';

const medicamentVide = {
  nom: '', dosage: '', frequence: '', duree: '', instructions: ''
};

function AjouterOrdonnance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');

  const [form, setForm] = useState({
    patient_id: '',
    consultation_id: '',
    notes: '',
    validite: '',
    statut: 'active'
  });

  const [medicaments, setMedicaments] = useState([{ ...medicamentVide }]);

  useEffect(() => {
    getPatients().then(res => setPatients(res.data.patients));
    getConsultations().then(res => setConsultations(res.data.consultations));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMed = (index, e) => {
    const updated = [...medicaments];
    updated[index][e.target.name] = e.target.value;
    setMedicaments(updated);
  };

  const ajouterMedicament = () => {
    setMedicaments([...medicaments, { ...medicamentVide }]);
  };

  const supprimerMedicament = (index) => {
    if (medicaments.length === 1) return;
    setMedicaments(medicaments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id) return setErreur('Sélectionnez un patient');
    if (medicaments.some(m => !m.nom)) return setErreur('Remplissez le nom de chaque médicament');

    setLoading(true);
    setErreur('');
    try {
      await ajouterOrdonnance({
        ...form,
        //medecin_id: user.id,
        medicaments
      });
      navigate('/ordonnances');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const patientSelectionne = patients.find(p => p._id === form.patient_id);
  const consultationsPatient = consultations.filter(
    c => c.patient_id?._id === form.patient_id || c.patient_id === form.patient_id
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/ordonnances')}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileMedical className="text-blue-600" /> Nouvelle Ordonnance
          </h2>
          <p className="text-gray-400 text-sm mt-1">Créez une prescription médicale complète</p>
        </div>
      </div>

      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
          ⚠️ {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Infos générales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">👤 Informations générales</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient */}
            <div>
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

            {/* Consultation liée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation liée <span className="text-gray-400 text-xs">(optionnel)</span>
              </label>
              <select
                name="consultation_id"
                value={form.consultation_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={!form.patient_id}
              >
                <option value="">-- Sélectionner une consultation --</option>
                {consultationsPatient.map(c => (
                  <option key={c._id} value={c._id}>
                    {new Date(c.date).toLocaleDateString('fr-FR')} — {c.motif}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="active">✅ Active</option>
                <option value="expirée">⏰ Expirée</option>
                <option value="annulée">❌ Annulée</option>
              </select>
            </div>

            {/* Validité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valide jusqu'au
              </label>
              <input
                type="date"
                name="validite"
                value={form.validite}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Carte patient */}
          {patientSelectionne && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Groupe sanguin</p>
                <p className="font-semibold text-red-500">{patientSelectionne.groupe_sanguin}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Allergies connues</p>
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

        {/* Médicaments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaPills className="text-blue-500" /> Médicaments
            </h3>
            <button
              type="button"
              onClick={ajouterMedicament}
              className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition border border-blue-200"
            >
              <FaPlus size={12} /> Ajouter un médicament
            </button>
          </div>

          <div className="space-y-4">
            {medicaments.map((med, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-xl p-5 bg-gray-50 relative"
              >
                {/* Numéro */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    💊 Médicament {index + 1}
                  </span>
                  {medicaments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => supprimerMedicament(index)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Nom du médicament <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nom"
                      value={med.nom}
                      onChange={(e) => handleMed(index, e)}
                      placeholder="Ex: Amoxicilline"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dosage</label>
                    <input
                      name="dosage"
                      value={med.dosage}
                      onChange={(e) => handleMed(index, e)}
                      placeholder="Ex: 500mg"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fréquence</label>
                    <select
                      name="frequence"
                      value={med.frequence}
                      onChange={(e) => handleMed(index, e)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Choisir --</option>
                      <option>1 fois par jour</option>
                      <option>2 fois par jour</option>
                      <option>3 fois par jour</option>
                      <option>Matin et soir</option>
                      <option>Avant chaque repas</option>
                      <option>Après chaque repas</option>
                      <option>Si nécessaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Durée</label>
                    <select
                      name="duree"
                      value={med.duree}
                      onChange={(e) => handleMed(index, e)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Choisir --</option>
                      <option>3 jours</option>
                      <option>5 jours</option>
                      <option>7 jours</option>
                      <option>10 jours</option>
                      <option>14 jours</option>
                      <option>21 jours</option>
                      <option>1 mois</option>
                      <option>3 mois</option>
                      <option>Traitement continu</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Instructions spéciales
                    </label>
                    <input
                      name="instructions"
                      value={med.instructions}
                      onChange={(e) => handleMed(index, e)}
                      placeholder="Ex: Prendre avec un grand verre d'eau, éviter le soleil..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Notes du médecin</h3>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Instructions supplémentaires, recommandations au patient..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/ordonnances')}
            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition shadow-md shadow-green-100 disabled:opacity-60"
          >
            <FaSave />
            {loading ? 'Enregistrement...' : 'Enregistrer l\'ordonnance'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjouterOrdonnance;