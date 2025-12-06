// src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data.data);
        setEnrolledCourses(data.data.enrolledCourses);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour {user.firstName} ! 👋
          </h1>
          <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-gray-600 text-sm">Cours en cours</p>
            <p className="text-2xl font-bold">{enrolledCourses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-gray-600 text-sm">Certificats</p>
            <p className="text-2xl font-bold">{user.certificates?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-gray-600 text-sm">Heures apprises</p>
            <p className="text-2xl font-bold">
              {enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0)}h
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-600 text-sm">Progression moyenne</p>
            <p className="text-2xl font-bold">
              {enrolledCourses.length > 0 
                ? Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* Continuer l'apprentissage */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Continuer l'apprentissage</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {enrolledCourses.filter(c => c.progress < 100).map(course => (
              <Link
                key={course.courseId._id}
                to={`/learn/${course.courseId.slug}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <img 
                  src={course.courseId.thumbnail}
                  alt={course.courseId.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{course.courseId.title}</h3>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="text-indigo-600 text-sm font-medium hover:underline">
                    Continuer →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Cours terminés */}
        {enrolledCourses.some(c => c.progress === 100) && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Cours terminés</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {enrolledCourses.filter(c => c.progress === 100).map(course => (
                <div
                  key={course.courseId._id}
                  className="bg-white rounded-xl shadow overflow-hidden"
                >
                  <img 
                    src={course.courseId.thumbnail}
                    alt={course.courseId.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{course.courseId.title}</h3>
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                      <span>✓</span>
                      <span>Terminé</span>
                    </div>
                    <button className="text-indigo-600 text-sm font-medium hover:underline">
                      Télécharger le certificat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}