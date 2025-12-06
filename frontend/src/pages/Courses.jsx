// src/pages/Courses.jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import CourseCard from '../components/CourseCard';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Tous les cours', emoji: '📚' },
    { id: 'developpement-web', name: 'Développement Web', emoji: '💻' },
    { id: 'design', name: 'Design & UI/UX', emoji: '🎨' },
    { id: 'marketing-digital', name: 'Marketing Digital', emoji: '📈' },
    { id: 'data-science', name: 'Data Science', emoji: '📊' },
    { id: 'business', name: 'Business', emoji: '💼' },
    { id: 'langues', name: 'Langues', emoji: '🌍' },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

const fetchCourses = async () => {
  setLoading(true);
  setCourses([
    {
      _id: '1',
      title: 'Formation Complète Développeur Web Full Stack MERN',
      slug: 'formation-mern-stack',
      description: 'Apprenez MongoDB, Express, React et Node.js pour devenir développeur full stack',
      category: 'developpement-web',  // ← CHANGE ICI
      instructor: {
        firstName: 'Ahmed',
        lastName: 'Benali'
      },
      pricing: {
        originalPrice: 2500,
        discountedPrice: 1500,
        discount: 40
      },
      rating: {
        average: 4.8
      },
      stats: {
        studentsEnrolled: 1250,
        totalDuration: 45
      }
    },
    {
      _id: '2',
      title: 'Design UI/UX avec Figma - De Débutant à Expert',
      slug: 'design-uiux-figma',
      description: 'Maîtrisez Figma et créez des interfaces modernes et professionnelles',
      category: 'design',  // ← CHANGE ICI
      instructor: {
        firstName: 'Fatima',
        lastName: 'Zahra'
      },
      pricing: {
        originalPrice: 1800,
        discountedPrice: 1200,
        discount: 33
      },
      rating: {
        average: 4.9
      },
      stats: {
        studentsEnrolled: 850,
        totalDuration: 30
      }
    },
    {
      _id: '3',
      title: 'Marketing Digital & Réseaux Sociaux 2024',
      slug: 'marketing-digital-2024',
      description: 'Stratégies complètes pour réussir sur Facebook, Instagram, TikTok et Google',
      category: 'marketing-digital',  // ← CHANGE ICI
      instructor: {
        firstName: 'Youssef',
        lastName: 'Alami'
      },
      pricing: {
        originalPrice: 2000,
        discountedPrice: 2000,
        discount: 0
      },
      rating: {
        average: 4.7
      },
      stats: {
        studentsEnrolled: 2100,
        totalDuration: 35
      }
    },
    {
      _id: '4',
      title: 'Python pour Data Science & Machine Learning',
      slug: 'python-data-science',
      description: 'Analyse de données, visualisation et algorithmes de ML avec Python',
      category: 'data-science',  // ← CHANGE ICI
      instructor: {
        firstName: 'Karim',
        lastName: 'Benjelloun'
      },
      pricing: {
        originalPrice: 2200,
        discountedPrice: 1600,
        discount: 27
      },
      rating: {
        average: 4.6
      },
      stats: {
        studentsEnrolled: 680,
        totalDuration: 50
      }
    },
    {
      _id: '5',
      title: 'Business Plan & Entrepreneuriat au Maroc',
      slug: 'business-entrepreneuriat',
      description: 'Créez et développez votre entreprise au Maroc avec succès',
      category: 'business',  // ← CHANGE ICI
      instructor: {
        firstName: 'Sophia',
        lastName: 'Idrissi'
      },
      pricing: {
        originalPrice: 1500,
        discountedPrice: 999,
        discount: 33
      },
      rating: {
        average: 4.8
      },
      stats: {
        studentsEnrolled: 1450,
        totalDuration: 25
      }
    },
    {
      _id: '6',
      title: 'Anglais Business - Niveau Intermédiaire à Avancé',
      slug: 'anglais-business',
      description: 'Maîtrisez l\'anglais professionnel pour votre carrière internationale',
      category: 'langues',  // ← CHANGE ICI
      instructor: {
        firstName: 'Sarah',
        lastName: 'Williams'
      },
      pricing: {
        originalPrice: 1200,
        discountedPrice: 1200,
        discount: 0
      },
      rating: {
        average: 4.9
      },
      stats: {
        studentsEnrolled: 2300,
        totalDuration: 40
      }
    }
  ]);
  setLoading(false);
};
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || 
      course.category?.toLowerCase().includes(selectedCategory) ||
      course.slug?.includes(selectedCategory);
    
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nos formations
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez nos cours créés par des experts marocains et internationaux
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Rechercher une formation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCourses.length} formation{filteredCourses.length > 1 ? 's' : ''} trouvée{filteredCourses.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune formation trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}