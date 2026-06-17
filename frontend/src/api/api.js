import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

export const getPatients = (params) => API.get('/patients', { params });
export const getPatient = (id) => API.get(`/patients/${id}`);
export const ajouterPatient = (data) => API.post('/patients', data);
export const modifierPatient = (id, data) => API.put(`/patients/${id}`, data);
export const supprimerPatient = (id) => API.delete(`/patients/${id}`);

export const getConsultations = () => API.get('/consultations');
export const ajouterConsultation = (data) => API.post('/consultations', data);
export const supprimerConsultation = (id) => API.delete(`/consultations/${id}`);
export const supprimerOrdonnance = (id) => API.delete(`/ordonnances/${id}`);
export const ajouterOrdonnance = (data) => API.post('/ordonnances', data);
export const getOrdonnances = () => API.get('/ordonnances');
export const getRendezVous = () => API.get('/rendezvous');
export const ajouterRendezVous = (data) => API.post('/rendezvous', data);
export const modifierRendezVous = (id, data) =>
  API.put(`/rendezvous/${id}`, data);// Remplace prendreRendezVous par :
export const prendreRendezVous = (data) => API.post('/rendezvous/prendre', data);
export const getRendezVousByPatient = ()   => API.get('/rendezvous/mes-rendezvous');
// Médecins (pour le select)
export const getMedecins = () => API.get('/utilisateurs/medecins');
export const getStats = () => API.get('/stats');

export default API;