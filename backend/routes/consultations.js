const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET — filtré par médecin si rôle médecin
router.get('/', protect, roles('admin', 'medecin', 'secretaire'), async (req, res) => {
  try {
    const filtre = {};
    if (req.user.role === 'medecin') {
      filtre.medecin_id = req.user._id;
    }

    const consultations = await Consultation.find(filtre)
      .populate('patient_id', 'nom prenom numero_dossier')
      .populate('medecin_id', 'nom prenom specialite')
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient_id')
      .populate('medecin_id', 'nom prenom');
    if (!consultation) return res.status(404).json({ message: 'Consultation non trouvée' });
    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, roles('admin', 'medecin'), async (req, res) => {
  try {
    const body = { ...req.body };
    body.medecin_id = req.user._id;

    ['prochain_rdv', 'diagnostic', 'traitement', 'notes'].forEach(field => {
      if (body[field] === '' || body[field] === null) delete body[field];
    });

    if (body.examen_clinique) {
      ['temperature', 'poids', 'taille', 'frequence_cardiaque'].forEach(field => {
        if (body.examen_clinique[field] === '' || body.examen_clinique[field] === null) {
          delete body.examen_clinique[field];
        }
      });
    }

    const consultation = await Consultation.create(body);
    res.status(201).json({ success: true, consultation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, roles('admin', 'medecin'), async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json({ success: true, consultation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, roles('admin', 'medecin'), async (req, res) => {
  try {
    await Consultation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Consultation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;