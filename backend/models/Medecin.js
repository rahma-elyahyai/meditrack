const mongoose = require('mongoose');

const medecinSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  specialite: String,
  telephone: String,
  email: { type: String, unique: true },
  mot_de_passe: String,
  actif: { type: Boolean, default: true }
});

module.exports = mongoose.model('Medecin', medecinSchema);