import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function Learn() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/connexion');
      return;
    }
    fetchCourse();
  }, [courseSlug, isAuthenticated, navigate]);

  useEffect(() => {
    if (course && course.chapters.length > 0) {
      const lesson = course.chapters[currentChapterIndex]?.lessons[currentLessonIndex];
      setCurrentLesson(lesson);
    }
  }, [currentChapterIndex, currentLessonIndex, course]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setCourse({
        _id: '1',
        title: 'Formation Complète Développeur Web Full Stack MERN',
        slug: 'formation-mern-stack',
        instructor: { firstName: 'Ahmed', lastName: 'Benali' },
        chapters: [
          {
            title: 'Introduction et Setup',
            lessons: [
              { 
                _id: 'l1',
                title: 'Bienvenue dans la formation', 
                duration: 10,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                description: 'Introduction à la formation MERN Stack.',
                resources: [
                  { name: 'Slides Introduction.pdf', url: '#' },
                  { name: 'Setup Guide.pdf', url: '#' }
                ]
              },
              { 
                _id: 'l2',
                title: 'Installation des outils', 
                duration: 15,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                description: 'Installation de Node.js, VS Code, MongoDB.',
                resources: []
              },
              { 
                _id: 'l3',
                title: 'Votre premier projet', 
                duration: 20,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                description: 'Création de votre premier projet Node.js.',
                resources: [{ name: 'Starter Code.zip', url: '#' }]
              }
            ]
          },
          {
            title: 'JavaScript Moderne',
            lessons: [
              { _id: 'l4', title: 'ES6+ Features', duration: 25, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Fonctionnalités modernes de JavaScript.', resources: [] },
              { _id: 'l5', title: 'Async/Await', duration: 30, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Programmation asynchrone.', resources: [] }
            ]
          },
          {
            title: 'React Fundamentals',
            lessons: [
              { _id: 'l6', title: 'Components et Props', duration: 35, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Composants React et props.', resources: [] }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalLessons = () => {
    if (!course) return 0;
    return course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  };

  const getProgress = () => {
    const total = getTotalLessons();
    return total > 0 ? Math.round((completedLessons.length / total) * 100) : 0;
  };

  const markAsCompleted = () => {
    if (currentLesson && !completedLessons.includes(currentLesson._id)) {
      setCompletedLessons([...completedLessons, currentLesson._id]);
    }
  };

  const goToNextLesson = () => {
    const currentChapter = course.chapters[currentChapterIndex];
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentChapterIndex < course.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentChapterIndex > 0) {
      const prevChapter = course.chapters[currentChapterIndex - 1];
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCurrentLessonIndex(prevChapter.lessons.length - 1);
    }
  };

  const selectLesson = (chapterIndex, lessonIndex) => {
    setCurrentChapterIndex(chapterIndex);
    setCurrentLessonIndex(lessonIndex);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cours introuvable</h2>
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline">Retour au dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gray-800 overflow-y-auto transition-all duration-300 flex-shrink-0`}>
        {sidebarOpen && (
          <div className="p-4">
            <div className="mb-6">
              <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
                ← Retour au dashboard
              </button>
              <h2 className="text-white font-bold text-lg mb-2">{course.title}</h2>
              <p className="text-gray-400 text-sm">Par {course.instructor.firstName} {course.instructor.lastName}</p>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progression</span>
                <span>{getProgress()}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${getProgress()}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{completedLessons.length} / {getTotalLessons()} leçons complétées</p>
            </div>
            <div className="space-y-2">
              {course.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex}>
                  <h3 className="text-white font-semibold text-sm mb-2 px-3 py-2 bg-gray-700 rounded">{chapter.title}</h3>
                  <div className="space-y-1">
                    {chapter.lessons.map((lesson, lessonIndex) => {
                      const isActive = chapterIndex === currentChapterIndex && lessonIndex === currentLessonIndex;
                      const isCompleted = completedLessons.includes(lesson._id);
                      return (
                        <button
                          key={lessonIndex}
                          onClick={() => selectLesson(chapterIndex, lessonIndex)}
                          className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                          {isCompleted ? <span className="text-green-400">✓</span> : <span className="text-gray-500">▶</span>}
                          <span className="flex-1">{lesson.title}</span>
                          <span className="text-xs text-gray-400">{lesson.duration}min</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-10 bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700">
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {currentLesson && (
          <div className="max-w-5xl mx-auto p-6">
            <div className="mb-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe src={currentLesson.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
                <button onClick={markAsCompleted} className={`px-4 py-2 rounded-lg font-medium ${completedLessons.includes(currentLesson._id) ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                  {completedLessons.includes(currentLesson._id) ? '✓ Complété' : 'Marquer comme complété'}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="border-b border-gray-700 mb-4">
                <div className="flex gap-4">
                  {['overview', 'resources', 'notes'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}>
                      {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'resources' ? 'Ressources' : 'Notes'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Description</h3>
                    <p className="text-gray-300">{currentLesson.description}</p>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Ressources téléchargeables</h3>
                    {currentLesson.resources && currentLesson.resources.length > 0 ? (
                      <div className="space-y-2">
                        {currentLesson.resources.map((resource, idx) => (
                          <a key={idx} href={resource.url} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                            <span className="text-2xl">📄</span>
                            <span className="text-white">{resource.name}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">Aucune ressource disponible</p>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Mes notes</h3>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Prenez des notes..." className="w-full h-64 bg-gray-700 text-white p-4 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"></textarea>
                    <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sauvegarder les notes</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={goToPreviousLesson} disabled={currentChapterIndex === 0 && currentLessonIndex === 0} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                ← Leçon précédente
              </button>
              <button onClick={goToNextLesson} disabled={currentChapterIndex === course.chapters.length - 1 && currentLessonIndex === course.chapters[currentChapterIndex].lessons.length - 1} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Leçon suivante →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}