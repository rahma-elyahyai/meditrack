import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import {
  FaArrowLeft, FaEdit, FaStethoscope, FaUserInjured,
  FaUserMd, FaHeartbeat, FaThermometerHalf, FaWeight,
  FaRulerVertical, FaNotesMedical, FaCalendarAlt, FaPills
} from 'react-icons/fa';

function DetailConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/consultations/${id}`)
      .then(res => setConsultation(res.data.consultation))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm">Chargement de la consultation...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Consultation introuvable</p>
          <button onClick={() => navigate('/consultations')} className="mt-4 text-blue-600 hover:underline text-sm">
            ← Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statutStyle = (s) => {
    switch (s) {
      case 'terminée':  return 'bg-green-50 text-green-600 border-green-100';
      case 'planifiée': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'en_cours':  return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'annulée':   return 'bg-red-50 text-red-500 border-red-100';
      default:          return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const statutLabel = (s) => {
    switch (s) {
      case 'terminée':  return '✅ Terminée';
      case 'planifiée': return '📅 Planifiée';
      case 'en_cours':  return '⏳ En cours';
      case 'annulée':   return '❌ Annulée';
      default: return s;
    }
  };

  const ec = consultation.examen_clinique || {};
  const imc = ec.poids && ec.taille
    ? (ec.poids / Math.pow(ec.taille / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/consultations')}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaStethoscope className="text-blue-600" /> Détail Consultation
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(consultation.date).toLocaleDateString('fr-FR', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statutStyle(consultation.statut)}`}>
            {statutLabel(consultation.statut)}
          </span>
          <button
            onClick={() => navigate(`/consultations/modifier/${consultation._id}`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-md shadow-blue-100"
          >
            <FaEdit /> Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne gauche — patient + médecin */}
        <div className="space-y-6">

          {/* Patient */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaUserInjured className="text-blue-400" /> Patient
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {consultation.patient_id?.prenom?.[0]}{consultation.patient_id?.nom?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {consultation.patient_id?.prenom} {consultation.patient_id?.nom}
                </p>
                <p className="text-xs text-blue-500 font-mono">{consultation.patient_id?.numero_dossier}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/patients/${consultation.patient_id?._id}`)}
              className="w-full text-center text-xs text-blue-600 hover:underline"
            >
              Voir le dossier patient →
            </button>
          </div>

          {/* Médecin */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaUserMd className="text-green-400" /> Médecin
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                {consultation.medecin_id?.prenom?.[0]}{consultation.medecin_id?.nom?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Dr. {consultation.medecin_id?.prenom} {consultation.medecin_id?.nom}
                </p>
                {consultation.medecin_id?.specialite && (
                  <p className="text-xs text-gray-400">{consultation.medecin_id.specialite}</p>
                )}
              </div>
            </div>
          </div>

          {/* Prochain RDV */}
          {consultation.prochain_rdv && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaCalendarAlt /> Prochain RDV
              </h4>
              <p className="text-lg font-bold text-purple-700">
                {new Date(consultation.prochain_rdv).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Colonne droite — détails médicaux */}
        <div className="lg:col-span-2 space-y-6">

          {/* Motif + Symptômes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">📋 Motif & Symptômes</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Motif de consultation</p>
                <p className="text-gray-800 font-medium">{consultation.motif}</p>
              </div>
              {consultation.symptomes?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Symptômes</p>
                  <div className="flex flex-wrap gap-2">
                    {consultation.symptomes.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium border border-orange-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Examen clinique */}
          {(ec.tension || ec.temperature || ec.poids || ec.taille || ec.frequence_cardiaque) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-red-400" /> Examen clinique
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ec.tension && (
                  <ExamenCard icon="❤️" label="Tension" value={ec.tension} unit="cmHg" color="bg-red-50 border-red-100 text-red-600" />
                )}
                {ec.temperature && (
                  <ExamenCard icon="🌡️" label="Température" value={ec.temperature} unit="°C" color="bg-orange-50 border-orange-100 text-orange-600" />
                )}
                {ec.poids && (
                  <ExamenCard icon="⚖️" label="Poids" value={ec.poids} unit="kg" color="bg-green-50 border-green-100 text-green-600" />
                )}
                {ec.taille && (
                  <ExamenCard icon="📏" label="Taille" value={ec.taille} unit="cm" color="bg-blue-50 border-blue-100 text-blue-600" />
                )}
                {ec.frequence_cardiaque && (
                  <ExamenCard icon="💓" label="Fréq. cardiaque" value={ec.frequence_cardiaque} unit="bpm" color="bg-purple-50 border-purple-100 text-purple-600" />
                )}
                {imc && (
                  <ExamenCard icon="📊" label="IMC" value={imc} unit="kg/m²" color="bg-gray-50 border-gray-200 text-gray-600" />
                )}
              </div>
            </div>
          )}

          {/* Diagnostic + Traitement */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaNotesMedical className="text-blue-400" /> Diagnostic & Traitement
            </h4>
            <div className="space-y-4">
              <Section label="Diagnostic" value={consultation.diagnostic} />
              <Section label="Traitement prescrit" value={consultation.traitement} icon={<FaPills className="text-blue-300 inline mr-1" />} />
              <Section label="Notes du médecin" value={consultation.notes} italic />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamenCard({ icon, label, value, unit, color }) {
  return (
    <div className={`rounded-xl p-4 border ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{icon} {label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-60">{unit}</p>
    </div>
  );
}

function Section({ label, value, icon, italic }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium mb-1">{icon}{label}</p>
      <p className={`text-gray-700 text-sm ${italic ? 'italic' : ''}`}>{value}</p>
    </div>
  );
}

export default DetailConsultation;