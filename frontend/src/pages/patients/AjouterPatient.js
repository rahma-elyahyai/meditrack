import { useState } from 'react';
import { ajouterPatient } from '../../api/api';
import { useNavigate } from 'react-router-dom';

function AjouterPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: 'M',
    telephone: '',
    email: '',
    adresse: '',
    groupe_sanguin: '',   // ✅ simple string, not a schema object
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await ajouterPatient(form);
      alert('Patient ajouté avec succès !');
      navigate('/patients');
    } catch (err) {
      // ✅ Show the error instead of silently failing
      const msg = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>➕ Ajouter un Patient</h2>

      {error && <p style={styles.error}>❌ {error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="nom" placeholder="Nom" onChange={handleChange} style={styles.input} required />
        <input name="prenom" placeholder="Prénom" onChange={handleChange} style={styles.input} required />
        <input name="date_naissance" type="date" onChange={handleChange} style={styles.input} />

        <select name="sexe" onChange={handleChange} style={styles.input}>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>

        <input name="telephone" placeholder="Téléphone" onChange={handleChange} style={styles.input} />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} style={styles.input} />
        <input name="adresse" placeholder="Adresse" onChange={handleChange} style={styles.input} />

        {/* ✅ Dropdown instead of free text — prevents invalid values reaching MongoDB */}
        <select name="groupe_sanguin" onChange={handleChange} style={styles.input}>
          <option value="">-- Groupe sanguin --</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '500px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    padding: '10px', borderRadius: '8px',
    border: '1px solid #ccc', fontSize: '15px'
  },
  btn: {
    backgroundColor: '#2c7be5', color: 'white',
    padding: '12px', border: 'none',
    borderRadius: '8px', fontSize: '16px', cursor: 'pointer'
  },
  error: {
    color: 'red', backgroundColor: '#fff0f0',
    padding: '10px', borderRadius: '8px',
    border: '1px solid #ffcccc'
  }
};

export default AjouterPatient;