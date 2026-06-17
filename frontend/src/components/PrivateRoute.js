// Dans PrivateRoute.jsx — modifier la redirection par défaut
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // ✅ Redirection selon rôle si pas de roles requis (route /dashboard générique)
  if (roles && !roles.includes(user.role)) {
    return user.role === 'patient'
      ? <Navigate to="/patient/dashboard" />
      : <Navigate to="/dashboard" />;
  }

  return children;
}

export default PrivateRoute;