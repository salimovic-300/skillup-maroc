// src/pages/InstructorDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      const { data } = await axios.get('/instructor/courses');
      setCourses(data.data || []);
      
      // Calculer les stats
      const totalStudents = data.data?.reduce((acc, c) => acc + (c.stats?.studentsCount || 0), 0) || 0;
      const totalRevenue = data.data?.reduce((acc, c) => acc + ((c.stats?.studentsCount || 0) * (c.price || 0)), 0) || 0;
      const ratings = data.data?.filter(c => c.ratings?.average > 0).map(c => c.ratings.average) || [];
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
      
      setStats({
        totalCourses: data.data?.length || 0,
        totalStudents,
        totalRevenue,
        avgRating
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    try {
      await axios.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Dashboard Instructeur</h1>
          <p className="text-white/80 mt-2">Bienvenue, {user?.profile?.firstName || 'Instructeur'} 👋</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mes Cours</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Étudiants</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenus</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue} DH</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Note Moyenne</p>
                <p className="text-3xl font-bold text-gray-900">⭐ {stats.avgRating}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes Cours</h2>
          <Link
            to="/instructor/courses/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <span>+</span> Créer un cours
          </Link>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun cours créé</h3>
            <p className="text-gray-500 mb-6">Commencez par créer votre premier cours</p>
            <Link
              to="/instructor/courses/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition inline-block"
            >
              Créer mon premier cours
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                      🎓
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{course.description?.substring(0, 100)}...</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>👥 {course.stats?.studentsCount || 0} étudiants</span>
                        <span>📚 {course.chapters?.length || 0} chapitres</span>
                        <span>⭐ {course.ratings?.average || 0}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {course.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-indigo-600">{course.price} DH</span>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/instructor/courses/${course._id}/edit`}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Modifier"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
