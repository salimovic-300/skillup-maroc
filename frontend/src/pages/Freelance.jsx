// src/pages/Freelance.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Freelance() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');

  // Données de démo
  const projects = [
    {
      id: '1',
      title: 'Développement site e-commerce pour boutique marocaine',
      description: 'Nous recherchons un développeur full stack pour créer un site e-commerce moderne pour notre boutique de produits artisanaux marocains.',
      budget: { min: 15000, max: 25000 },
      duration: '2-3 mois',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      client: {
        name: 'Artisanat Maroc',
        rating: 4.8,
        projectsPosted: 12
      },
      proposals: 8,
      postedAt: '2025-12-08',
      category: 'Développement Web'
    },
    {
      id: '2',
      title: 'Design UI/UX pour application mobile de livraison',
      description: 'Conception complète d\'une application mobile de livraison de repas. Nous avons besoin d\'un designer expérimenté en UI/UX.',
      budget: { min: 8000, max: 12000 },
      duration: '1 mois',
      skills: ['Figma', 'UI/UX Design', 'Mobile Design', 'Prototypage'],
      client: {
        name: 'FastFood Delivery',
        rating: 4.5,
        projectsPosted: 5
      },
      proposals: 15,
      postedAt: '2025-12-07',
      category: 'Design'
    },
    {
      id: '3',
      title: 'Campagne Marketing Digital pour startup tech',
      description: 'Recherche expert en marketing digital pour lancer notre startup. SEO, réseaux sociaux, Google Ads, et stratégie de contenu.',
      budget: { min: 10000, max: 18000 },
      duration: '3 mois',
      skills: ['SEO', 'Google Ads', 'Social Media', 'Content Marketing'],
      client: {
        name: 'TechStart Maroc',
        rating: 5.0,
        projectsPosted: 3
      },
      proposals: 12,
      postedAt: '2025-12-06',
      category: 'Marketing'
    },
    {
      id: '4',
      title: 'Développement API REST pour plateforme fintech',
      description: 'Développement d\'une API REST sécurisée pour notre plateforme de paiement. Expérience en fintech requise.',
      budget: { min: 20000, max: 35000 },
      duration: '4 mois',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Stripe'],
      client: {
        name: 'PayMaroc',
        rating: 4.9,
        projectsPosted: 8
      },
      proposals: 6,
      postedAt: '2025-12-05',
      category: 'Développement Web'
    },
    {
      id: '5',
      title: 'Analyse de données et Dashboard BI',
      description: 'Création d\'un dashboard Business Intelligence pour analyser nos données de vente. Python, SQL, et visualisation de données.',
      budget: { min: 12000, max: 20000 },
      duration: '2 mois',
      skills: ['Python', 'SQL', 'Power BI', 'Data Analysis'],
      client: {
        name: 'RetailData',
        rating: 4.7,
        projectsPosted: 15
      },
      proposals: 10,
      postedAt: '2025-12-04',
      category: 'Data Science'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBudget = selectedBudget === 'all' ||
      (selectedBudget === 'low' && project.budget.max <= 10000) ||
      (selectedBudget === 'medium' && project.budget.max > 10000 && project.budget.max <= 20000) ||
      (selectedBudget === 'high' && project.budget.max > 20000);
    
    const matchesSkill = selectedSkill === 'all' || project.skills.includes(selectedSkill);

    return matchesSearch && matchesBudget && matchesSkill;
  });

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Projets Freelance 💼
          </h1>
          <p className="text-gray-600">
            Trouvez des missions adaptées à vos compétences
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Projets disponibles</p>
            <p className="text-2xl font-bold text-indigo-600">{projects.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Budget moyen</p>
            <p className="text-2xl font-bold text-green-600">15K DH</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Durée moyenne</p>
            <p className="text-2xl font-bold text-blue-600">2 mois</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Vos candidatures</p>
            <p className="text-2xl font-bold text-purple-600">0</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar filtres */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Filtres</h3>

              {/* Recherche */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recherche
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mots-clés..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tous les budgets</option>
                  <option value="low">Moins de 10K DH</option>
                  <option value="medium">10K - 20K DH</option>
                  <option value="high">Plus de 20K DH</option>
                </select>
              </div>

              {/* Compétences */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compétence
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Toutes les compétences</option>
                  <option value="React">React</option>
                  <option value="Node.js">Node.js</option>
                  <option value="Figma">Figma</option>
                  <option value="Python">Python</option>
                  <option value="SEO">SEO</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBudget('all');
                  setSelectedSkill('all');
                }}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>

          {/* Liste des projets */}
          <div className="md:col-span-3">
            <div className="mb-4 text-gray-600">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
            </div>

            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/freelance/${project.id}`)}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition cursor-pointer p-6"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <span className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                          {project.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Compétences */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Infos */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>💰</span>
                          <span className="font-semibold text-green-600">
                            {project.budget.min.toLocaleString()} - {project.budget.max.toLocaleString()} DH
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{project.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📝</span>
                          <span>{project.proposals} propositions</span>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {getTimeAgo(project.postedAt)}
                      </div>
                    </div>

                    {/* Client */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {project.client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {project.client.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>⭐ {project.client.rating}</span>
                            <span>•</span>
                            <span>{project.client.projectsPosted} projets</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/freelance/${project.id}`);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                      >
                        Voir le projet →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun projet trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos filtres de recherche
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}