import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function CoursePlayer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/connexion'); return; }
    fetchCourseData();
  }, [slug, isAuthenticated]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        axios.get(`/courses/${slug}`),
        axios.get(`/progress/${slug}`)
      ]);
      const courseData = courseRes.data.data;
      setCourse(courseData);
      const progressData = progressRes.data.data || {};
      setCompletedLessons(progressData.completedLessons || []);
      
      if (courseData.chapters?.length > 0 && courseData.chapters[0].lessons?.length > 0) {
        const lastChapter = progressData.lastChapterIndex || 0;
        const lastLesson = progressData.lastLessonIndex || 0;
        setCurrentChapterIndex(lastChapter);
        setCurrentLessonIndex(lastLesson);
        setCurrentLesson(courseData.chapters[lastChapter]?.lessons[lastLesson]);
      }
    } catch (error) {
      if (error.response?.status === 403) { alert('Vous devez acheter ce cours'); navigate(`/cours/${slug}`); }
    } finally { setLoading(false); }
  };

  const selectLesson = (chapterIndex, lessonIndex) => {
    const lesson = course.chapters[chapterIndex]?.lessons[lessonIndex];
    if (lesson) {
      setCurrentChapterIndex(chapterIndex);
      setCurrentLessonIndex(lessonIndex);
      setCurrentLesson(lesson);
      axios.post(`/progress/${slug}`, { lastChapterIndex: chapterIndex, lastLessonIndex: lessonIndex });
    }
  };

  const markLessonComplete = async () => {
    const lessonId = `${currentChapterIndex}-${currentLessonIndex}`;
    if (completedLessons.includes(lessonId)) return;
    try {
      await axios.post(`/progress/${slug}/complete-lesson`, { lessonId, chapterIndex: currentChapterIndex, lessonIndex: currentLessonIndex });
      setCompletedLessons([...completedLessons, lessonId]);
      goToNextLesson();
    } catch (error) { console.error('Erreur:', error); }
  };

  const goToNextLesson = () => {
    const currentChapter = course.chapters[currentChapterIndex];
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
      selectLesson(currentChapterIndex, currentLessonIndex + 1);
    } else if (currentChapterIndex < course.chapters.length - 1) {
      selectLesson(currentChapterIndex + 1, 0);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      selectLesson(currentChapterIndex, currentLessonIndex - 1);
    } else if (currentChapterIndex > 0) {
      const prevChapter = course.chapters[currentChapterIndex - 1];
      selectLesson(currentChapterIndex - 1, prevChapter.lessons.length - 1);
    }
  };

  const calculateProgress = () => {
    if (!course?.chapters) return 0;
    const totalLessons = course.chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
    return totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  };

  const isLessonCompleted = (chapterIndex, lessonIndex) => completedLessons.includes(`${chapterIndex}-${lessonIndex}`);

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500"></div></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><h2>Cours non trouvé</h2></div>;

  const videoUrl = getVideoEmbedUrl(currentLesson?.videoUrl);
  const isEmbed = currentLesson?.videoUrl?.includes('youtube') || currentLesson?.videoUrl?.includes('vimeo');

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gray-800 transition-all overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <Link to="/mes-cours" className="text-gray-400 hover:text-white text-sm">← Mes cours</Link>
          <h2 className="text-white font-semibold mt-2 line-clamp-2">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progression</span>
              <span className="text-indigo-400">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {course.chapters?.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="border-b border-gray-700">
              <div className="p-4 bg-gray-750"><h3 className="text-white text-sm font-medium">Chapitre {chapterIndex + 1}: {chapter.title}</h3></div>
              {chapter.lessons?.map((lesson, lessonIndex) => {
                const isActive = currentChapterIndex === chapterIndex && currentLessonIndex === lessonIndex;
                const isCompleted = isLessonCompleted(chapterIndex, lessonIndex);
                return (
                  <button key={lessonIndex} onClick={() => selectLesson(chapterIndex, lessonIndex)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-white text-indigo-600' : 'bg-gray-600'}`}>
                      {isCompleted ? '✓' : lessonIndex + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{lesson.duration || 0} min</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-4 left-4 z-10 bg-gray-800 text-white p-2 rounded-lg">
          {sidebarOpen ? '←' : '→'}
        </button>
        <div className="flex-1 flex items-center justify-center bg-black">
          {videoUrl ? (
            isEmbed ? (
              <iframe src={videoUrl} className="w-full h-full max-h-[70vh]" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <video ref={videoRef} src={videoUrl} controls className="w-full max-h-[70vh]" onEnded={markLessonComplete} />
            )
          ) : (
            <div className="text-center text-gray-400"><div className="text-6xl mb-4">🎬</div><p>Aucune vidéo disponible</p></div>
          )}
        </div>
        <div className="bg-gray-800 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Chapitre {currentChapterIndex + 1}, Leçon {currentLessonIndex + 1}</p>
                <h1 className="text-white text-xl font-semibold">{currentLesson?.title || 'Leçon'}</h1>
              </div>
              <button onClick={markLessonComplete} disabled={isLessonCompleted(currentChapterIndex, currentLessonIndex)}
                className={`px-4 py-2 rounded-lg font-medium ${isLessonCompleted(currentChapterIndex, currentLessonIndex) ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {isLessonCompleted(currentChapterIndex, currentLessonIndex) ? '✓ Terminée' : 'Marquer terminée'}
              </button>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-700">
              <button onClick={goToPrevLesson} className="text-gray-400 hover:text-white">← Précédent</button>
              <button onClick={goToNextLesson} className="text-indigo-400 hover:text-indigo-300">Suivant →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
