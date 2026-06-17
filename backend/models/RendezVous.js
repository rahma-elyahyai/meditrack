const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medecin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  secretaire_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  heure: { type: String, required: true },
  duree: { type: Number, default: 30 },
  motif: String,
  statut: {
    type: String,
    enum: ['planifié', 'confirmé', 'annulé', 'terminé'],
    default: 'planifié'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', rendezVousSchema);