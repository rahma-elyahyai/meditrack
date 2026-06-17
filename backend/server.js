const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => console.log('❌ Erreur:', err));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/medecins',     require('./routes/medecins'));
app.use('/api/consultations',require('./routes/consultations'));
app.use('/api/ordonnances',  require('./routes/ordonnances'));
app.use('/api/rendezvous',   require('./routes/rendezvous'));
app.use('/api/stats',        require('./routes/stats'));
app.use('/api/utilisateurs', require('./routes/utilisateurs')); 
// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'MediTrack API fonctionne !' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
});