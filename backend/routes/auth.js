const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');
// Générer token
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, telephone } = req.body;

    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const user = await User.create({
      nom, prenom, email, mot_de_passe, role, telephone
    });

    res.status(201).json({
      success: true,
      token: genererToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const correct = await user.comparePassword(mot_de_passe);
    if (!correct) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

   await User.updateOne(
  { _id: user._id },
  { $set: { derniere_connexion: Date.now() } }
);
    res.json({
      success: true,
      token: genererToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Déconnecté avec succès' });
});
// POST /api/auth/users — admin seulement
router.post('/users', protect, roles('admin'), async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, telephone } = req.body;

    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const user = await User.create({ nom, prenom, email, mot_de_passe, role, telephone });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id, nom: user.nom, prenom: user.prenom,
        email: user.email, role: user.role, actif: user.actif,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET tous les utilisateurs — admin seulement
router.get('/users', protect, roles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-mot_de_passe').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT modifier utilisateur — admin seulement
router.put('/users/:id', protect, roles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom: req.body.nom, prenom: req.body.prenom, telephone: req.body.telephone, role: req.body.role, actif: req.body.actif },
      { new: true }
    ).select('-mot_de_passe');
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer utilisateur — admin seulement
router.delete('/users/:id', protect, roles('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;