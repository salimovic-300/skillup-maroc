// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold">
              SkillUp <span className="text-indigo-600">Maroc</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/formations" className="text-gray-700 hover:text-indigo-600 transition">
              Formations
            </Link>
            <Link to="/freelance" className="text-gray-700 hover:text-indigo-600 transition">
              Freelance
            </Link>
            <Link to="/a-propos" className="text-gray-700 hover:text-indigo-600 transition">
              À propos
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.firstName}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link 
                      to="/profil" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Mon profil
                    </Link>
                    <Link 
                      to="/mes-cours" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Mes cours
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/connexion"
                  className="text-gray-700 hover:text-indigo-600 transition font-medium"
                >
                  Connexion
                </Link>
                <Link 
                  to="/inscription"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}