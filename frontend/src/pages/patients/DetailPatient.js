import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient } from '../../api/api';
import {
  FaArrowLeft, FaEdit, FaUserInjured, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaTint, FaAllergies,
  FaHeartbeat, FaIdCard, FaCalendarAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

function DetailPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatient(id)
      .then(res => setPatient(res.data.patient))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm">Chargement du dossier patient...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Patient introuvable</p>
          <button onClick={() => navigate('/patients')} className="mt-4 text-blue-600 hover:underline text-sm">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const age = patient.date_naissance
    ? Math.floor((new Date() - new Date(patient.date_naissance)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserInjured className="text-blue-600" /> Dossier Patient
            </h2>
            <p className="text-gray-400 text-sm mt-1 font-mono">{patient.numero_dossier}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/patients/modifier/${patient._id}`)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
        >
          <FaEdit /> Modifier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Carte identité */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto mb-4">
              {patient.prenom?.[0]}{patient.nom?.[0]}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{patient.prenom} {patient.nom}</h3>
            <p className="text-gray-400 text-sm mt-1">
              {patient.sexe === 'M' ? '♂ Masculin' : patient.sexe === 'F' ? '♀ Féminin' : '—'}
              {age ? ` · ${age} ans` : ''}
            </p>

            {/* Statut */}
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                patient.actif
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500'
              }`}>
                {patient.actif
                  ? <><FaCheckCircle /> Actif</>
                  : <><FaTimesCircle /> Inactif</>
                }
              </span>
            </div>

            {/* Groupe sanguin */}
            {patient.groupe_sanguin && (
              <div className="mt-5 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">
                  <FaTint className="inline mr-1" />Groupe sanguin
                </p>
                <p className="text-2xl font-bold text-red-500">{patient.groupe_sanguin}</p>
              </div>
            )}

            {/* N° Dossier */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                <FaIdCard className="inline mr-1" />N° Dossier
              </p>
              <p className="font-mono font-bold text-blue-600">{patient.numero_dossier}</p>
            </div>

            {/* Date création */}
            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                <FaCalendarAlt className="inline mr-1" />Enregistré le
              </p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(patient.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Infos détaillées */}
        <div className="lg:col-span-2 space-y-6">

          {/* Coordonnées */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-base font-semibold text-gray-800 mb-4">📞 Coordonnées</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<FaPhone className="text-blue-400" />} label="Téléphone" value={patient.telephone} />
              <InfoRow icon={<FaEnvelope className="text-blue-400" />} label="Email" value={patient.email} />
              <InfoRow icon={<FaMapMarkerAlt className="text-blue-400" />} label="Adresse" value={patient.adresse} full />
            </div>
          </div>

          {/* Informations médicales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-base font-semibold text-gray-800 mb-4">🏥 Informations médicales</h4>
            <div className="space-y-4">

              {/* Date de naissance */}
              {patient.date_naissance && (
                <InfoRow
                  icon={<FaCalendarAlt className="text-purple-400" />}
                  label="Date de naissance"
                  value={new Date(patient.date_naissance).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                />
              )}

              {/* Allergies */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaAllergies className="text-orange-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Allergies</p>
                </div>
                {patient.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium border border-orange-100">
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune allergie connue</p>
                )}
              </div>

              {/* Maladies chroniques */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaHeartbeat className="text-red-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Maladies chroniques</p>
                </div>
                {patient.maladies_chroniques?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.maladies_chroniques.map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                        {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune maladie chronique</p>
                )}
              </div>

              {/* Mutuelle */}
              {patient.mutuelle && (
                <InfoRow icon={<FaIdCard className="text-green-400" />} label="Mutuelle" value={patient.mutuelle} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-medium text-gray-700 pl-6">{value || '—'}</p>
    </div>
  );
}

export default DetailPatient;