const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const Ordonnance = require('../models/Ordonnance');
const RendezVous = require('../models/RendezVous');
const protect = require('../middleware/auth');
const roles = require('../middleware/roles');

router.get('/', protect, roles('admin', 'medecin', 'secretaire', 'patient'), async (req, res) => {
  try {
    // ✅ Si patient, retourner uniquement ses propres stats
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ user_id: req.user._id });
      if (!patient) return res.status(404).json({ message: 'Dossier patient introuvable' });

      const rdvs = await RendezVous.find({ patient_id: patient._id });
      return res.json({
        success: true,
        stats: {
          rdv: {
            total:      rdvs.length,
            confirmes:  rdvs.filter(r => r.statut === 'confirmé').length,
            enAttente:  rdvs.filter(r => r.statut === 'planifié').length,
            annules:    rdvs.filter(r => r.statut === 'annulé').length,
          }
        }
      });
    }

    // ── Stats staff (code existant inchangé) ──────────────────
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, totalConsultations, totalOrdonnances, totalRdv] = await Promise.all([
      Patient.countDocuments({ actif: true }),
      Consultation.countDocuments(),
      Ordonnance.countDocuments(),
      RendezVous.countDocuments(),
    ]);

    const [patientsMois, consultationsMois, ordonnancesMois, rdvMois] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: debutMois } }),
      Consultation.countDocuments({ createdAt: { $gte: debutMois } }),
      Ordonnance.countDocuments({ createdAt: { $gte: debutMois } }),
      RendezVous.countDocuments({ createdAt: { $gte: debutMois } }),
    ]);

    const debutAujourdhui = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const finAujourdhui = new Date(debutAujourdhui);
    finAujourdhui.setDate(finAujourdhui.getDate() + 1);
    const rdvAujourdhui = await RendezVous.countDocuments({
      date: { $gte: debutAujourdhui, $lt: finAujourdhui }
    });

    const [consultTerminees, consultPlanifiees, consultEnCours] = await Promise.all([
      Consultation.countDocuments({ statut: 'terminée' }),
      Consultation.countDocuments({ statut: 'planifiée' }),
      Consultation.countDocuments({ statut: 'en_cours' }),
    ]);

    const ordonnancesActives = await Ordonnance.countDocuments({ statut: 'active' });

    const [rdvPlanifies, rdvConfirmes, rdvAnnules] = await Promise.all([
      RendezVous.countDocuments({ statut: 'planifié' }),
      RendezVous.countDocuments({ statut: 'confirmé' }),
      RendezVous.countDocuments({ statut: 'annulé' }),
    ]);

    const dernieresConsultations = await Consultation.find()
      .populate('patient_id', 'nom prenom')
      .populate('medecin_id', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(4)
      .select('motif statut createdAt patient_id medecin_id');

    const derniersPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('nom prenom numero_dossier createdAt');

    const derniersRdv = await RendezVous.find()
      .populate('patient_id', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(3)
      .select('motif statut date heure patient_id createdAt');

    const sixMoisAgo = new Date();
    sixMoisAgo.setMonth(sixMoisAgo.getMonth() - 5);
    sixMoisAgo.setDate(1);

    const consultationsParMois = await Consultation.aggregate([
      { $match: { createdAt: { $gte: sixMoisAgo } } },
      { $group: {
        _id: { mois: { $month: '$createdAt' }, annee: { $year: '$createdAt' } },
        total: { $sum: 1 }
      }},
      { $sort: { '_id.annee': 1, '_id.mois': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totaux: { patients: totalPatients, consultations: totalConsultations, ordonnances: totalOrdonnances, rdv: totalRdv },
        mois: { patients: patientsMois, consultations: consultationsMois, ordonnances: ordonnancesMois, rdv: rdvMois },
        rdvAujourdhui,
        consultations: { terminees: consultTerminees, planifiees: consultPlanifiees, enCours: consultEnCours },
        ordonnancesActives,
        rdv: { planifies: rdvPlanifies, confirmes: rdvConfirmes, annules: rdvAnnules },
      },
      activite: {
        consultations: dernieresConsultations,
        patients: derniersPatients,
        rdv: derniersRdv,
      },
      graphiques: { consultationsParMois }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;