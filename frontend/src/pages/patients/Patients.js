import { useEffect, useState } from 'react';
import { getPatients, supprimerPatient } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getPatients({ search });
      setPatients(res.data.patients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, [search]);

  const supprimer = async (id) => {
    if (window.confirm('Supprimer ce patient définitivement ?')) {
      await supprimerPatient(id);
      charger();
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patients</h2>
          <p className="text-gray-400 text-sm">{patients.length} patients enregistrés</p>
        </div>
        <button
          onClick={() => navigate('/patients/ajouter')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow"
        >
          <FaPlus /> Nouveau patient
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou numéro dossier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-semibold text-gray-600">N° Dossier</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Nom complet</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Téléphone</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Groupe sanguin</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Statut</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-400">Chargement...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-400">Aucun patient trouvé</td></tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-blue-50 transition">
                  <td className="px-6 py-4 font-mono text-blue-600">{p.numero_dossier}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{p.prenom} {p.nom}</td>
                  <td className="px-6 py-4 text-gray-500">{p.telephone}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
                      {p.groupe_sanguin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      p.actif ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {p.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/patients/${p._id}`)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Voir"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => navigate(`/patients/modifier/${p._id}`)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => supprimer(p._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Patients;