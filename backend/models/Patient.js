const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: Date,
  sexe: { type: String, enum: ['M', 'F'] },
  telephone: String,
  email: String,
  adresse: String,
  groupe_sanguin: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [String],
  maladies_chroniques: [String],
  mutuelle: String,
  numero_dossier: { type: String, unique: true },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

// Générer numéro dossier automatiquement
// ✅ Correct for Mongoose v7+
// In Patient.js — replace the pre('save') hook

patientSchema.pre('save', async function () {
  if (!this.numero_dossier) {
    this.numero_dossier = await generateNumeroDossier();
  }
});

async function generateNumeroDossier() {
  const last = await mongoose.model('Patient')
    .findOne({ numero_dossier: { $regex: /^PAT-\d+$/ } })
    .sort({ numero_dossier: -1 })
    .select('numero_dossier')
    .lean();

  const lastNum = last
    ? parseInt(last.numero_dossier.replace('PAT-', ''), 10)
    : 0;

  return `PAT-${String(lastNum + 1).padStart(5, '0')}`;
}

module.exports = mongoose.model('Patient', patientSchema);