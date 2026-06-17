const mongoose = require('mongoose');

const ordonnanceSchema = new mongoose.Schema({
  consultation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medecin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  medicaments: [{
    nom: { type: String, required: true },
    dosage: String,
    frequence: String,
    duree: String,
    instructions: String
  }],
  validite: { type: Date },
  statut: {
    type: String,
    enum: ['active', 'expirée', 'annulée'],
    default: 'active'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Ordonnance', ordonnanceSchema);