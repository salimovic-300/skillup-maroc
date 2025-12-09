// src/pages/MesCours.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MesCours() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, in-progress, completed

  // Données de démo - À remplacer par un appel API
  const courses = [
    {
      id: '1',
      title: 'Formation Complète Développeur Web Full Stack MERN',
      slug: 'formation-mern-stack',
      instructor: 'Ahmed Benali',
      thumbnail: null,
      progress: 0,
      totalLessons: 6,
      completedLessons: 0,
      lastLesson: 'Bienvenue dans la formation',
      timeSpent: 0,
      enrolledAt: '2025-12-08',
      category: 'Développement Web'
    },
    {
      id: '2',
      title: 'Design UI/UX avec Figma',
      slug: 'design-uiux-figma',
      instructor: 'Fatima Zahra',
      thumbnail: null,
      progress: 35,
      totalLessons: 20,
      completedLessons: 7,
      lastLesson: 'Prototypage interactif',
      timeSpent: 420,
      enrolledAt: '2025-12-01',
      category: 'Design'
    },
    {
      id: '3',
      title: 'Marketing Digital & Réseaux Sociaux',
      slug: 'marketing-digital-2024',
      instructor: 'Youssef Alami',
      thumbnail: null,
      progress: 100,
      totalLessons: 15,
      completedLessons: 15,
      lastLesson: 'Projet final',
      timeSpent: 1200,
      enrolledAt: '2025-11-15',
      category: 'Marketing',
      certificateAvailable: true
    }
  ];

  const filteredCourses = courses.filter(course => {
    if (filter === 'in-progress') return course.progress > 0 && course.progress < 100;
    if (filter === 'completed') return course.progress === 100;
    return true;
  });

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes cours
          </h1>
          <p className="text-gray-600">
            Gérez vos formations et suivez votre progression
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-2xl font-bold text-indigo-600">{courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">En cours</p>
            <p className="text-2xl font-bold text-blue-600">
              {courses.filter(c => c.progress > 0 && c.progress < 100).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Terminés</p>
            <p className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.progress === 100).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Temps total</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatTime(courses.reduce((acc, c) => acc + c.timeSpent, 0))}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({courses.length})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'in-progress'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En cours ({courses.filter(c => c.progress > 0 && c.progress < 100).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Terminés ({courses.filter(c => c.progress === 100).length})
            </button>
          </div>
        </div>

        {/* Liste des cours */}
        {filteredCourses.length > 0 ? (
          <div className="space-y-4">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="md:flex">
                  {/* Thumbnail */}
                  <div className="md:w-64 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-6xl">
                      {course.category === 'Design' ? '🎨' : course.category === 'Marketing' ? '📈' : '🎓'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                          {course.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Par {course.instructor}
                        </p>
                      </div>
                      {course.certificateAvailable && (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          🏆 Certificat disponible
                        </span>
                      )}
                    </div>

                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression : {course.completedLessons} / {course.totalLessons} leçons</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            course.progress === 100 ? 'bg-green-600' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{formatTime(course.timeSpent)} passées</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📚</span>
                        <span>Dernière leçon : {course.lastLesson}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {course.progress === 100 ? (
                        <>
                          <button
                            onClick={() => navigate(`/learn/${course.slug}`)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                          >
                            Revoir le cours
                          </button>
                          <button
                            onClick={() => alert('Téléchargement du certificat...')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            📥 Télécharger le certificat
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/learn/${course.slug}`)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                          >
                            {course.progress > 0 ? 'Continuer le cours →' : 'Commencer le cours →'}
                          </button>
                          <button
                            onClick={() => navigate(`/cours/${course.slug}`)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                          >
                            Détails du cours
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'completed' ? 'Aucun cours terminé' : 'Aucun cours en cours'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'completed' 
                ? 'Terminez vos cours en cours pour obtenir vos certificats'
                : 'Explorez nos formations pour commencer à apprendre'}
            </p>
            <button
              onClick={() => navigate('/formations')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Découvrir les formations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}