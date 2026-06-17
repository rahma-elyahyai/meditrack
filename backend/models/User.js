const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mot_de_passe: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['admin', 'medecin', 'secretaire', 'patient'],
    required: true
  },
  telephone: String,
  actif: { type: Boolean, default: true },
  date_creation: { type: Date, default: Date.now },
  derniere_connexion: Date
}, { timestamps: true });

// models/User.js — same fix
userSchema.pre('save', async function () {
  if (!this.isModified('mot_de_passe')) return;
  const salt = await bcrypt.genSalt(10);
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
});

// Comparer les mots de passe
userSchema.methods.comparePassword = async function (motDePasse) {
  return await bcrypt.compare(motDePasse, this.mot_de_passe);
};

module.exports = mongoose.model('User', userSchema);