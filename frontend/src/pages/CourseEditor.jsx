// src/pages/CourseEditor.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import VideoUploader from '../components/VideoUploader';

const CATEGORIES = [
  { value: 'developpement-web', label: 'Développement Web' },
  { value: 'mobile', label: 'Développement Mobile' },
  { value: 'design', label: 'Design UI/UX' },
  { value: 'marketing', label: 'Marketing Digital' },
  { value: 'business', label: 'Business & Entrepreneuriat' },
  { value: 'data', label: 'Data Science & IA' }
];

const LEVELS = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' }
];

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  const [course, setCourse] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'developpement-web',
    level: 'debutant',
    price: 0,
    originalPrice: 0,
    language: 'fr',
    requirements: [''],
    learningOutcomes: [''],
    chapters: [],
    status: 'draft'
  });

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/instructor/courses/${id}`);
      setCourse(data.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Cours non trouvé');
      navigate('/instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...course[field]];
    newArray[index] = value;
    setCourse(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setCourse(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    setCourse(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Chapters management
  const addChapter = () => {
    setCourse(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: '', description: '', lessons: [] }]
    }));
  };

  const updateChapter = (chapterIndex, field, value) => {
    const newChapters = [...course.chapters];
    newChapters[chapterIndex][field] = value;
    setCourse(prev => ({ ...prev, chapters: newChapters }));
  };

  const removeChapter = (chapterIndex) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== chapterIndex)
    }));
  };

  // Lessons management
  const addLesson = (chapterIndex) => {
    const newChapters = [...course.chapters];
    newChapters[chapterIndex].lessons.push({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      isFree: false
    });
    setCourse(prev => ({ ...prev, chapters: newChapters }));
  };

  const updateLesson = (chapterIndex, lessonIndex, field, value) => {
    const newChapters = [...course.chapters];
    newChapters[chapterIndex].lessons[lessonIndex][field] = value;
    setCourse(prev => ({ ...prev, chapters: newChapters }));
  };

  const removeLesson = (chapterIndex, lessonIndex) => {
    const newChapters = [...course.chapters];
    newChapters[chapterIndex].lessons = newChapters[chapterIndex].lessons.filter((_, i) => i !== lessonIndex);
    setCourse(prev => ({ ...prev, chapters: newChapters }));
  };

  const handleSubmit = async (status = 'draft') => {
    setSaving(true);
    try {
      const payload = { ...course, status };
      
      if (isEditing) {
        await axios.put(`/courses/${id}`, payload);
      } else {
        await axios.post('/courses', payload);
      }
      
      alert(status === 'published' ? 'Cours publié !' : 'Cours sauvegardé !');
      navigate('/instructor');
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/instructor')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Retour
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Modifier le cours' : 'Créer un cours'}
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Publication...' : 'Publier le cours'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {['info', 'contenu', 'prix'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 border-b-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'info' ? 'Informations' : tab === 'contenu' ? 'Contenu' : 'Prix & Publication'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab: Informations */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du cours *
                  </label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Ex: Formation Complète React.js"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description courte
                  </label>
                  <input
                    type="text"
                    value={course.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="Une phrase qui résume votre cours"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description complète *
                  </label>
                  <textarea
                    value={course.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Décrivez votre cours en détail..."
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={course.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau *
                    </label>
                    <select
                      value={course.level}
                      onChange={(e) => handleChange('level', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Prérequis</h2>
              <div className="space-y-3">
                {course.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                      placeholder="Ex: Connaissances de base en JavaScript"
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => removeArrayItem('requirements', index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('requirements')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Ajouter un prérequis
                </button>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Ce que les étudiants apprendront</h2>
              <div className="space-y-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                      placeholder="Ex: Créer des applications React complètes"
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => removeArrayItem('learningOutcomes', index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('learningOutcomes')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Ajouter un objectif
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Contenu */}
        {activeTab === 'contenu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Chapitres et leçons</h2>
                <button
                  onClick={addChapter}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                >
                  + Ajouter un chapitre
                </button>
              </div>

              {course.chapters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📖</div>
                  <p>Aucun chapitre. Commencez par en ajouter un.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {course.chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded font-medium">
                          Chapitre {chapterIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => updateChapter(chapterIndex, 'title', e.target.value)}
                          placeholder="Titre du chapitre"
                          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => removeChapter(chapterIndex)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Lessons */}
                      <div className="ml-8 space-y-3">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-gray-400 text-sm">Leçon {lessonIndex + 1}</span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'title', e.target.value)}
                                placeholder="Titre de la leçon"
                                className="flex-1 px-3 py-1.5 border rounded focus:ring-2 focus:ring-indigo-500"
                              />
                              <input
                                type="number"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'duration', parseInt(e.target.value) || 0)}
                                placeholder="Durée (min)"
                                className="w-24 px-3 py-1.5 border rounded focus:ring-2 focus:ring-indigo-500"
                              />
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={lesson.isFree}
                                  onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'isFree', e.target.checked)}
                                  className="rounded"
                                />
                                Gratuit
                              </label>
                              <button
                                onClick={() => removeLesson(chapterIndex, lessonIndex)}
                                className="text-red-500 hover:bg-red-100 p-1 rounded"
                              >
                                ✕
                              </button>
                            </div>
                            {/* VideoUploader remplace l'input URL */}
                            <VideoUploader
                              currentUrl={lesson.videoUrl || ''}
                              onUploadComplete={(data) => updateLesson(chapterIndex, lessonIndex, 'videoUrl', data.url)}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => addLesson(chapterIndex)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Ajouter une leçon
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Prix */}
        {activeTab === 'prix' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Tarification</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (DH) *
                  </label>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                    placeholder="1500"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix original (DH) - pour afficher une réduction
                  </label>
                  <input
                    type="number"
                    value={course.originalPrice}
                    onChange={(e) => handleChange('originalPrice', parseInt(e.target.value) || 0)}
                    placeholder="2500"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {course.originalPrice > course.price && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700">
                    💰 Réduction de {Math.round((1 - course.price / course.originalPrice) * 100)}% 
                    ({course.originalPrice - course.price} DH d'économie)
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Publication</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Statut actuel</p>
                    <p className="text-sm text-gray-500">
                      {course.status === 'published' ? 'Ce cours est visible par les étudiants' : 'Ce cours est en brouillon'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.status === 'published' ? '✓ Publié' : '⏳ Brouillon'}
                  </span>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    💡 <strong>Conseil :</strong> Assurez-vous d'avoir au moins un chapitre avec une leçon avant de publier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
