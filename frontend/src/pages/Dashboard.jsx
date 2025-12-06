import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue {user?.firstName || 'Utilisateur'} ! 👋
              </h1>
              <p className="text-gray-600">Heureux de vous revoir sur SkillUp Maroc</p>
            </div>
            <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-600 text-sm">Cours en cours</p>
            <p className="text-3xl font-bold text-indigo-600">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-600 text-sm">Certificats</p>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-4xl mb-2">⏱️</div>
            <p className="text-gray-600 text-sm">Heures apprises</p>
            <p className="text-3xl font-bold text-blue-600">0h</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-600 text-sm">Progression</p>
            <p className="text-3xl font-bold text-purple-600">0%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/formations')} className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Explorer les formations</h3>
              <p className="text-sm text-gray-600">Découvrez nos cours</p>
            </button>
            <button onClick={() => navigate('/freelance')} className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Projets freelance</h3>
              <p className="text-sm text-gray-600">Trouvez des missions</p>
            </button>
            <button onClick={() => navigate('/profil')} className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Mon profil</h3>
              <p className="text-sm text-gray-600">Paramètres du compte</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Activité récente</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aucune activité pour le moment</p>
            <p className="text-sm mt-2">Commencez par explorer nos formations !</p>
          </div>
        </div>
      </div>
    </div>
  );
}