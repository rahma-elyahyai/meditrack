import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>🏥 MediTrack</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Accueil</Link>
        <Link to="/patients" style={styles.link}>Patients</Link>
        <Link to="/consultations" style={styles.link}>Consultations</Link>
        <Link to="/ordonnances" style={styles.link}>Ordonnances</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c7be5',
    padding: '12px 30px',
    color: 'white'
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: '20px'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px'
  }
};

export default Navbar;