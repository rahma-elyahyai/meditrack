import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, modifierPatient } from '../../api/api';
import { FaArrowLeft, FaSave, FaUserEdit } from 'react-icons/fa';

function ModifierPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '',
    sexe: '', telephone: '', email: '',
    adresse: '', groupe_sanguin: '', mutuelle: '',
    allergies: '', maladies_chroniques: '', actif: true
  });

  useEffect(() => {
    getPatient(id)
      .then(res => {
        const p = res.data.patient;
        setForm({
          nom: p.nom || '',
          prenom: p.prenom || '',
          date_naissance: p.date_naissance
            ? new Date(p.date_naissance).toISOString().split('T')[0]
            : '',
          sexe: p.sexe || '',
          telephone: p.telephone || '',
          email: p.email || '',
          adresse: p.adresse || '',
          groupe_sanguin: p.groupe_sanguin || '',
          mutuelle: p.mutuelle || '',
          allergies: p.allergies?.join(', ') || '',
          maladies_chroniques: p.maladies_chroniques?.join(', ') || '',
          actif: p.actif
        });
      })
      .catch(() => setErreur('Impossible de charger le patient'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setErreur('');
    try {
      const body = { ...form };

      // Clean empty optional enum fields
      ['groupe_sanguin', 'sexe', 'date_naissance', 'telephone',
       'email', 'adresse', 'mutuelle'].forEach(field => {
        if (body[field] === '') delete body[field];
      });

      // Convert comma-separated strings to arrays
      body.allergies = form.allergies
        ? form.allergies.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      body.maladies_chroniques = form.maladies_chroniques
        ? form.maladies_chroniques.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await modifierPatient(id, body);
      setSucces(true);
      setTimeout(() => navigate(`/patients/${id}`), 1200);
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
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserEdit className="text-blue-600" /> Modifier le patient
          </h2>
          <p className="text-gray-400 text-sm mt-1">Modifiez les informations du dossier</p>
        </div>
      </div>

      {/* Alerts */}
      {erreur && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
          ⚠️ {erreur}
        </div>
      )}
      {succes && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6">
          ✅ Patient modifié avec succès ! Redirection...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Identité */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">👤 Identité</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <input
                type="date"
                name="date_naissance"
                value={form.date_naissance}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
              <select
                name="sexe"
                value={form.sexe}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Non renseigné --</option>
                <option value="M">♂ Masculin</option>
                <option value="F">♀ Féminin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                name="actif"
                value={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.value === 'true' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="true">● Actif</option>
                <option value="false">● Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">📞 Coordonnées</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="06XXXXXXXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@exemple.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                placeholder="Adresse complète"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Informations médicales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">🏥 Informations médicales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Groupe sanguin</label>
              <select
                name="groupe_sanguin"
                value={form.groupe_sanguin}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Non renseigné --</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mutuelle</label>
              <input
                name="mutuelle"
                value={form.mutuelle}
                onChange={handleChange}
                placeholder="Nom de la mutuelle"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies <span className="text-gray-400 text-xs">(séparées par des virgules)</span>
              </label>
              <input
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="Ex: pénicilline, arachides, latex"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maladies chroniques <span className="text-gray-400 text-xs">(séparées par des virgules)</span>
              </label>
              <input
                name="maladies_chroniques"
                value={form.maladies_chroniques}
                onChange={handleChange}
                placeholder="Ex: diabète, hypertension, asthme"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(`/patients/${id}`)}
            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loadingForm || succes}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition shadow-md shadow-blue-100 disabled:opacity-60"
          >
            <FaSave />
            {loadingForm ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModifierPatient;