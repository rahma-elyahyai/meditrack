const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET tous les patients — admin, médecin, secrétaire
router.get('/', protect, roles('admin', 'medecin', 'secretaire', 'patient'), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { numero_dossier: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, page, patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET un patient par ID
router.get('/:id', protect, roles('admin', 'medecin', 'secretaire', 'patient'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, roles('admin', 'secretaire'), async (req, res) => {
  try {
    const body = { ...req.body };
    ['groupe_sanguin', 'sexe', 'date_naissance', 'telephone',
     'email', 'adresse', 'mutuelle'].forEach(field => {
      if (body[field] === '' || body[field] === null) delete body[field];
    });

    let patient;
    let attempts = 0;

    // Retry up to 3 times in case of rare concurrent duplicate
    while (attempts < 3) {
      try {
        patient = await Patient.create(body);
        break; // success
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.numero_dossier) {
          attempts++;
          // Clear the stale numero_dossier so pre('save') regenerates it
          delete body.numero_dossier;
          if (attempts >= 3) throw err;
        } else {
          throw err; // unrelated error, rethrow immediately
        }
      }
    }

    res.status(201).json({ success: true, patient });
  } catch (err) {
    console.error('❌ ERREUR DÉTAILLÉE:', JSON.stringify(err, null, 2));
    res.status(400).json({ message: err.message, details: err.errors });
  }
});
router.put('/:id', protect, roles('admin', 'secretaire'), async (req, res) => {
  try {
    const body = { ...req.body };

    ['groupe_sanguin', 'sexe', 'date_naissance', 'telephone',
     'email', 'adresse', 'mutuelle'].forEach(field => {
      if (body[field] === '' || body[field] === null) delete body[field];
    });

    const patient = await Patient.findByIdAndUpdate(
      req.params.id, body, { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer patient — admin seulement
router.delete('/:id', protect, roles('admin'), async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Patient supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;