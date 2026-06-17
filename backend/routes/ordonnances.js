const express = require('express');
const router = express.Router();
const Ordonnance = require('../models/Ordonnance');
const Patient = require('../models/Patient');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET — filtré par médecin si rôle médecin
router.get('/', protect, roles('admin', 'medecin', 'patient'), async (req, res) => {
  try {
    const filtre = {};

    if (req.user.role === 'medecin') {
      filtre.medecin_id = req.user._id;
    }

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user_id: req.user._id });
      if (!patient) return res.json({ success: true, ordonnances: [] });
      filtre.patient_id = patient._id;
    }

    const ordonnances = await Ordonnance.find(filtre)
      .populate('patient_id', 'nom prenom numero_dossier')
      .populate('medecin_id', 'nom prenom')
      .populate('consultation_id', 'motif date')
      .sort({ createdAt: -1 });

    res.json({ success: true, ordonnances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET par ID
router.get('/:id', protect, async (req, res) => {
  try {
    const ordonnance = await Ordonnance.findById(req.params.id)
      .populate('patient_id')
      .populate('medecin_id', 'nom prenom specialite')
      .populate('consultation_id', 'motif date');
    if (!ordonnance) return res.status(404).json({ message: 'Ordonnance non trouvée' });
    res.json({ success: true, ordonnance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer — medecin_id forcé depuis le token
router.post('/', protect, roles('admin', 'medecin'), async (req, res) => {
  try {
    const body = { ...req.body };

    // Toujours forcer le médecin depuis le JWT — jamais depuis le frontend
    body.medecin_id = req.user._id;

    // Nettoyer les champs optionnels vides
    ['consultation_id', 'validite', 'notes'].forEach(f => {
      if (body[f] === '' || body[f] === null || body[f] === undefined) delete body[f];
    });

    const ordonnance = await Ordonnance.create(body);
    const populated = await Ordonnance.findById(ordonnance._id)
      .populate('patient_id', 'nom prenom numero_dossier')
      .populate('medecin_id', 'nom prenom');

    res.status(201).json({ success: true, ordonnance: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT modifier
router.put('/:id', protect, roles('admin', 'medecin'), async (req, res) => {
  try {
    const ordonnance = await Ordonnance.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).populate('patient_id', 'nom prenom').populate('medecin_id', 'nom prenom');
    res.json({ success: true, ordonnance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', protect, roles('admin', 'medecin'), async (req, res) => {
  try {
    await Ordonnance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ordonnance supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;