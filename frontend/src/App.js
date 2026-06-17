import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardPatient from './pages/DashboardPatient';        // ✅ chemin corrigé
import Patients from './pages/patients/Patients';
import AjouterPatient from './pages/patients/AjouterPatient';
import Consultations from './pages/consultations/Consultations';
import AjouterConsultation from './pages/consultations/AjouterConsultation';
import Ordonnances from './pages/ordonnances/Ordonnances';
import AjouterOrdonnance from './pages/ordonnances/AjouterOrdonnance';
import RendezVous from './pages/rendezvous/RendezVous';
import Utilisateurs from './pages/utilisateurs/Utilisateurs';
import Statistiques from './pages/statistiques/Statistiques';
import DetailPatient from './pages/patients/DetailPatient';
import ModifierPatient from './pages/patients/ModifierPatient';
import DetailConsultation from './pages/consultations/DetailConsultation';
import ModifierConsultation from './pages/consultations/ModifierConsultation';
import DetailOrdonnance from './pages/ordonnances/DetailOrdonnance';
import LandingPage from './pages/LandingPage';
import MesRendezVous from './pages/patient/MesRendezVous';
import PrendreRendezVous from './pages/patient/PrendreRendezVous';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard — staff */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['admin', 'medecin', 'secretaire']}>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />

          {/* ✅ Dashboard — patient */}
          <Route path="/patient/dashboard" element={
            <PrivateRoute roles={['patient']}>
              <Layout><DashboardPatient /></Layout>
            </PrivateRoute>
          } />

          {/* Patients */}
          <Route path="/patients" element={
            <PrivateRoute roles={['admin', 'medecin', 'secretaire']}>
              <Layout><Patients /></Layout>
            </PrivateRoute>
          } />
          <Route path="/patients/ajouter" element={
            <PrivateRoute roles={['admin', 'secretaire']}>
              <Layout><AjouterPatient /></Layout>
            </PrivateRoute>
          } />
          <Route path="/patients/:id" element={
            <PrivateRoute roles={['admin', 'medecin', 'secretaire']}>
              <Layout><DetailPatient /></Layout>
            </PrivateRoute>
          } />
          <Route path="/patients/modifier/:id" element={
            <PrivateRoute roles={['admin', 'secretaire']}>
              <Layout><ModifierPatient /></Layout>
            </PrivateRoute>
          } />

          {/* Consultations */}
          <Route path="/consultations" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><Consultations /></Layout>
            </PrivateRoute>
          } />
          <Route path="/consultations/ajouter" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><AjouterConsultation /></Layout>
            </PrivateRoute>
          } />
          <Route path="/consultations/:id" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><DetailConsultation /></Layout>
            </PrivateRoute>
          } />
          <Route path="/consultations/modifier/:id" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><ModifierConsultation /></Layout>
            </PrivateRoute>
          } />

          {/* Ordonnances */}
          <Route path="/ordonnances" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><Ordonnances /></Layout>
            </PrivateRoute>
          } />
          <Route path="/ordonnances/ajouter" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><AjouterOrdonnance /></Layout>
            </PrivateRoute>
          } />
          <Route path="/ordonnances/:id" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><DetailOrdonnance /></Layout>
            </PrivateRoute>
          } />

          {/* Rendez-vous — staff */}
          <Route path="/rendezvous" element={
            <PrivateRoute roles={['admin', 'medecin', 'secretaire']}>
              <Layout><RendezVous /></Layout>
            </PrivateRoute>
          } />

          {/* Rendez-vous — patient */}
          <Route path="/patient/rendezvous" element={
            <PrivateRoute roles={['patient']}>
              <Layout><MesRendezVous /></Layout>
            </PrivateRoute>
          } />
          <Route path="/patient/rendezvous/prendre" element={
            <PrivateRoute roles={['patient']}>
              <Layout><PrendreRendezVous /></Layout>
            </PrivateRoute>
          } />

          {/* Utilisateurs & Stats */}
          <Route path="/utilisateurs" element={
            <PrivateRoute roles={['admin']}>
              <Layout><Utilisateurs /></Layout>
            </PrivateRoute>
          } />
          <Route path="/statistiques" element={
            <PrivateRoute roles={['admin', 'medecin']}>
              <Layout><Statistiques /></Layout>
            </PrivateRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;