import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaUserInjured, FaStethoscope,
  FaFileMedical, FaCalendarAlt, FaUsers,
  FaSignOutAlt, FaChartBar
} from 'react-icons/fa';

const ROLE_COLORS = {
  admin:      { bg: '#E6F1FB', text: '#0C447C' },
  medecin:    { bg: '#E1F5EE', text: '#085041' },
  secretaire: { bg: '#FAEEDA', text: '#633806' },
  patient:    { bg: '#FAECE7', text: '#712B13' },
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canSee = (roles) => roles.includes(user?.role);
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.patient;
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`;

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#0a1e3c',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ padding: '28px 24px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'inline-block' }}
          title="Retour à l'accueil"
        >
          <p style={{
            fontFamily: "'Lora', serif",
            fontSize: 20, fontWeight: 600,
            color: '#fff', margin: '0 0 2px',
            letterSpacing: 0.2,
          }}>
            Medi<span style={{ color: '#7EC8E3' }}>Track</span>
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: 1 }}>
            SYSTÈME MÉDICAL
          </p>
        </div>
      </div>

      {/* Profil */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: roleStyle.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: roleStyle.text,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontSize: 13, fontWeight: 500,
              color: '#fff', margin: '0 0 5px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.prenom} {user?.nom}
            </p>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: roleStyle.text,
              background: roleStyle.bg,
              padding: '2px 10px', borderRadius: 50,
              textTransform: 'capitalize',
            }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
  { to: '/dashboard',          icon: <FaHome size={13} />,        label: 'Tableau de bord', roles: ['admin','medecin','secretaire','patient'] },
  { to: '/patients',           icon: <FaUserInjured size={13} />, label: 'Patients',         roles: ['admin','medecin','secretaire'] },
  { to: '/consultations',      icon: <FaStethoscope size={13} />, label: 'Consultations',    roles: ['admin','medecin'] },
  { to: '/ordonnances',        icon: <FaFileMedical size={13} />, label: 'Ordonnances',      roles: ['admin','medecin'] },
  { to: '/rendezvous',         icon: <FaCalendarAlt size={13} />, label: 'Rendez-vous',      roles: ['admin','medecin','secretaire'] },
  { to: '/patient/rendezvous', icon: <FaCalendarAlt size={13} />, label: 'Mes rendez-vous',  roles: ['patient'] },  // ✅ nouveau
  { to: '/utilisateurs',       icon: <FaUsers size={13} />,       label: 'Utilisateurs',     roles: ['admin'] },
  { to: '/statistiques',       icon: <FaChartBar size={13} />,    label: 'Statistiques',     roles: ['admin','medecin'] },
].filter(item => canSee(item.roles)).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(126,200,227,0.15)' : 'transparent',
              borderLeft: isActive ? '2px solid #7EC8E3' : '2px solid transparent',
            })}
          >
            <span style={{ opacity: 0.85 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Déconnexion */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 14px',
            background: 'transparent', border: 'none',
            borderRadius: 4, cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <FaSignOutAlt size={13} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;