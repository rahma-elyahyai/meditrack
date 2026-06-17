const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET tous les utilisateurs — admin seulement
router.get('/', protect, roles('admin'), async (req, res) => {
  try {
    const utilisateurs = await User.find()
      .select('-mot_de_passe')
      .sort({ nom: 1 });
    res.json({ success: true, utilisateurs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET médecins — accessible aux patients aussi (pour le select RDV)
router.get('/medecins', protect, roles('admin', 'secretaire', 'medecin', 'patient'), async (req, res) => {
  try {
    const medecins = await User.find({ role: 'medecin' })
      .select('nom prenom specialite')
      .sort({ nom: 1 });
    res.json({ success: true, medecins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET un utilisateur par ID — admin
router.get('/:id', protect, roles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-mot_de_passe');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ success: true, utilisateur: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer un utilisateur — admin
router.post('/', protect, roles('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    const { mot_de_passe, ...safe } = user.toObject();
    res.status(201).json({ success: true, utilisateur: safe });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT modifier un utilisateur — admin
router.put('/:id', protect, roles('admin'), async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.mot_de_passe;
    const user = await User.findByIdAndUpdate(
      req.params.id, body, { new: true, runValidators: true }
    ).select('-mot_de_passe');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ success: true, utilisateur: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer un utilisateur — admin
router.delete('/:id', protect, roles('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;