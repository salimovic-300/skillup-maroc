// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';  // ← AJOUTE CETTE LIGNE

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar simple */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold text-indigo-600">SkillUp Maroc</span>
          </a>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <a href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </a>
            ) : (
              <>
                <a href="/connexion" className="text-gray-700 hover:text-indigo-600">
                  Connexion
                </a>
                <a href="/inscription" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  S'inscrire
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/formations" element={<Courses />} />  {/* ← AJOUTE CETTE LIGNE */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/connexion" />
            } 
          />
        </Routes>
      </main>

      <footer className="bg-gray-900 text-white p-4 text-center">
        <p>© 2024 SkillUp Maroc 🇲🇦</p>
      </footer>
    </div>
  );
}

export default App;