const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medecin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  motif: { type: String, required: true },
  diagnostic: String,
  symptomes: [String],
  examen_clinique: {
    tension: String,
    temperature: Number,
    poids: Number,
    taille: Number,
    frequence_cardiaque: Number
  },
  traitement: String,
  notes: String,
  statut: {
    type: String,
    enum: ['planifiée', 'en_cours', 'terminée', 'annulée'],
    default: 'terminée'
  },
  prochain_rdv: Date
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);