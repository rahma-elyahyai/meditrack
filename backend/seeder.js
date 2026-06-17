// seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('✅ Connecté');
  await User.deleteMany({});

  const hash = (pwd) => bcrypt.hash(pwd, 10);

  await User.insertMany([
    {
      nom: 'System', prenom: 'Admin',
      email: 'admin@meditrack.ma',
      mot_de_passe: await hash('admin123'),
      role: 'admin'
    },
    {
      nom: 'Dupont', prenom: 'Jean',
      email: 'medecin@meditrack.ma',
      mot_de_passe: await hash('med123'),
      role: 'medecin'
    },
    {
      nom: 'Martin', prenom: 'Sophie',
      email: 'sec@meditrack.ma',
      mot_de_passe: await hash('sec123'),
      role: 'secretaire'
    },
  ]);

  console.log('✅ Utilisateurs créés');
  process.exit();
}).catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});