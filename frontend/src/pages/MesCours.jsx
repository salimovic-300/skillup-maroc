import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function MesCours() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnrolledCourses(); }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const { data } = await axios.get('/users/enrolled-courses');
      setEnrolledCourses(data.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Mes Cours</h1>
          <p className="text-white/80 mt-2">Continuez votre apprentissage, {user?.profile?.firstName || 'Étudiant'} 👋</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun cours pour le moment</h3>
            <p className="text-gray-500 mb-6">Explorez notre catalogue et commencez à apprendre !</p>
            <Link to="/formations" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 inline-block">
              Découvrir les formations
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => {
              const course = enrollment.course;
              const progress = enrollment.progress || 0;
              return (
                <div key={enrollment._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">🎓</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course?.title || 'Cours'}</h3>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Progression</span>
                        <span className="font-medium text-indigo-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>📚 {course?.chapters?.length || 0} chapitres</span>
                    </div>
                    <Link to={`/learn/${course?.slug}`} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                      {progress > 0 ? '▶ Continuer' : '▶ Commencer'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
