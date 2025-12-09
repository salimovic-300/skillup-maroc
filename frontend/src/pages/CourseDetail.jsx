// src/pages/CourseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/courses/${slug}`);
      setCourse(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démo si API ne répond pas
      setCourse({
        _id: '1',
        title: 'Formation Complète Développeur Web Full Stack MERN',
        slug: 'formation-mern-stack',
        description: 'Devenez développeur Full Stack en maîtrisant MongoDB, Express.js, React et Node.js. Cette formation complète vous permettra de créer des applications web modernes de A à Z.',
        category: 'developpement-web',
        thumbnail: null,
        instructor: {
          firstName: 'Ahmed',
          lastName: 'Benali',
          title: 'Senior Full Stack Developer',
          bio: '10 ans d\'expérience en développement web. Formateur certifié et passionné par l\'enseignement.'
        },
        pricing: {
          originalPrice: 2500,
          discountedPrice: 1500,
          discount: 40
        },
        rating: {
          average: 4.8,
          count: 450
        },
        stats: {
          studentsEnrolled: 1250,
          totalDuration: 45,
          totalLessons: 180
        },
        requirements: [
          'Bases en HTML et CSS',
          'Connaissance basique de JavaScript',
          'Un ordinateur avec connexion internet',
          'Motivation et envie d\'apprendre'
        ],
        learningOutcomes: [
          'Créer des applications web complètes avec le stack MERN',
          'Maîtriser React et ses hooks',
          'Développer des APIs REST avec Node.js et Express',
          'Gérer des bases de données MongoDB',
          'Déployer vos applications en production',
          'Authentification JWT et sécurité'
        ],
        chapters: [
          {
            title: 'Introduction et Setup',
            lessons: [
              { title: 'Bienvenue dans la formation', duration: 10 },
              { title: 'Installation des outils', duration: 15 },
              { title: 'Votre premier projet', duration: 20 }
            ]
          },
          {
            title: 'JavaScript Moderne',
            lessons: [
              { title: 'ES6+ Features', duration: 25 },
              { title: 'Async/Await', duration: 30 },
              { title: 'Promises', duration: 20 }
            ]
          },
          {
            title: 'React Fundamentals',
            lessons: [
              { title: 'Components et Props', duration: 35 },
              { title: 'State et Lifecycle', duration: 40 },
              { title: 'Hooks en détail', duration: 45 }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
  if (!isAuthenticated) {
    navigate('/connexion', { state: { from: `/cours/${slug}` } });
    return;
  }

  try {
    // Appel API pour créer la session Stripe
    const { data } = await axios.post('/payments/create-checkout-session', {
      courseId: course._id
    });

    // Le backend retourne { success: true, url: "..." }
    if (data.success && data.url) {
      // Redirection vers Stripe Checkout
      window.location.href = data.url;
    } else {
      alert('Erreur lors de la création de la session de paiement');
    }
  } catch (error) {
    console.error('Erreur paiement:', error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert('Erreur lors de la création de la session de paiement');
    }
  }
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cours introuvable</h2>
          <button onClick={() => navigate('/formations')} className="text-indigo-600 hover:underline">
            Retour aux formations
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Info principale */}
            <div className="md:col-span-2">
              <div className="mb-4">
              {course?.category && (
  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
    {course.category}
  </span>
)}
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-white/90 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-300">⭐</span>
                  <span className="font-semibold">{course.rating.average}</span>
                  <span className="text-white/80">({course.rating.count} avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{course.stats.studentsEnrolled} étudiants</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📚</span>
                  <span>{course.stats.totalLessons} leçons</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{course.stats.totalDuration}h de contenu</span>
                </div>
              </div>

              {/* Instructeur */}
              <div className="mt-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">{course.instructor.firstName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{course.instructor.firstName} {course.instructor.lastName}</p>
                  <p className="text-sm text-white/80">{course.instructor.title}</p>
                </div>
              </div>
            </div>

            {/* Card d'achat */}
            <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-900 h-fit">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-6xl">
                🎓
              </div>

              <div className="mb-4">
                {course.pricing.discount > 0 ? (
                  <div>
                    <span className="text-3xl font-bold text-indigo-600">
                      {course.pricing.discountedPrice} DH
                    </span>
                    <span className="text-lg text-gray-500 line-through ml-2">
                      {course.pricing.originalPrice} DH
                    </span>
                    <div className="mt-1">
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                        -{course.pricing.discount}% de réduction
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">
                    {course.pricing.originalPrice} DH
                  </span>
                )}
              </div>

              <button
                onClick={handleEnroll}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition mb-3"
              >
                S'inscrire maintenant
              </button>

              <p className="text-center text-sm text-gray-500 mb-4">
                Garantie satisfait ou remboursé 14 jours
              </p>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accès illimité à vie</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Certificat de fin de formation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Support instructeur</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Accès mobile et desktop</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Ce que vous allez apprendre */}
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Ce que vous allez apprendre</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Contenu du cours */}
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Contenu du cours</h2>
              <p className="text-gray-600 mb-6">
                {course.chapters.length} chapitres • {course.stats.totalLessons} leçons • {course.stats.totalDuration}h
              </p>

              <div className="space-y-3">
                {course.chapters.map((chapter, idx) => (
                  <details key={idx} className="border rounded-lg overflow-hidden">
                    <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium flex justify-between items-center">
                      <span>{chapter.title}</span>
                      <span className="text-sm text-gray-500">{chapter.lessons.length} leçons</span>
                    </summary>
                    <div className="px-4 pb-4 space-y-2 bg-gray-50">
                      {chapter.lessons.map((lesson, lessonIdx) => (
                        <div key={lessonIdx} className="flex items-center justify-between py-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">▶</span>
                            <span>{lesson.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{lesson.duration} min</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Prérequis */}
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Prérequis</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructeur */}
            <section className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Votre instructeur</h2>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-indigo-600">
                    {course.instructor.firstName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </h3>
                  <p className="text-gray-600 mb-2">{course.instructor.title}</p>
                  <p className="text-gray-700">{course.instructor.bio}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar sticky */}
          <div>
            <div className="sticky top-4">
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold mb-4">Ce cours comprend :</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span>📹</span>
                    <span>{course.stats.totalDuration}h de vidéo HD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>📄</span>
                    <span>Ressources téléchargeables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🏆</span>
                    <span>Certificat de fin</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>♾️</span>
                    <span>Accès illimité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>📱</span>
                    <span>Mobile et TV</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}