const express = require('express');
const router = express.Router();
const RendezVous = require('../models/RendezVous');
const Patient = require('../models/Patient');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');

// GET — filtré automatiquement par médecin si rôle médecin
router.get('/', protect, roles('admin', 'medecin', 'secretaire'), async (req, res) => {
  try {
    const filtre = {};
    if (req.user.role === 'medecin') {
      filtre.medecin_id = req.user._id;
    }

    const rendezVous = await RendezVous.find(filtre)
      .populate('patient_id', 'nom prenom numero_dossier telephone')
      .populate('medecin_id', 'nom prenom')
      .sort({ date: 1, heure: 1 });

    res.json({ success: true, rendezVous });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET mes rendez-vous — patient connecté
router.get('/mes-rendezvous', protect, roles('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user_id: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Dossier patient introuvable' });

    const rendezVous = await RendezVous.find({ patient_id: patient._id })
      .populate('medecin_id', 'nom prenom specialite')
      .sort({ date: -1 });

    res.json({ success: true, rendezVous });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer — staff
router.post('/', protect, roles('admin', 'medecin', 'secretaire'), async (req, res) => {
  try {
    const body = { ...req.body };

    // Si médecin, forcer son propre ID
    if (req.user.role === 'medecin') {
      body.medecin_id = req.user._id;
    }

    // Si secrétaire, enregistrer son ID
    if (req.user.role === 'secretaire') {
      body.secretaire_id = req.user._id;
    }

    // Nettoyer les champs vides optionnels
    ['motif', 'notes'].forEach(f => {
      if (body[f] === '' || body[f] === null) delete body[f];
    });

    const rdv = await RendezVous.create(body);
    const populated = await RendezVous.findById(rdv._id)
      .populate('patient_id', 'nom prenom numero_dossier')
      .populate('medecin_id', 'nom prenom');

    res.status(201).json({ success: true, rdv: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST prendre RDV — patient
router.post('/prendre', protect, roles('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user_id: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Dossier patient introuvable' });

    const { medecin_id, date, heure, motif } = req.body;

    const conflit = await RendezVous.findOne({
      medecin_id, date: new Date(date), heure,
      statut: { $in: ['planifié', 'confirmé'] }
    });
    if (conflit) return res.status(409).json({ message: 'Ce créneau est déjà pris.' });

    const rdv = await RendezVous.create({
      patient_id: patient._id,
      medecin_id,
      date: new Date(date),
      heure,
      motif: motif || '',
      statut: 'planifié'
    });

    const populated = await rdv.populate('medecin_id', 'nom prenom specialite');
    res.status(201).json({ success: true, rdv: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT modifier statut
router.put('/:id', protect, roles('admin', 'medecin', 'secretaire'), async (req, res) => {
  try {
    const rdv = await RendezVous.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient_id', 'nom prenom numero_dossier')
      .populate('medecin_id', 'nom prenom');
    res.json({ success: true, rdv });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', protect, roles('admin', 'secretaire'), async (req, res) => {
  try {
    await RendezVous.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rendez-vous supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;