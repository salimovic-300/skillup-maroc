// src/pages/FreelanceDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FreelanceDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    estimatedBudget: '',
    estimatedDuration: '',
    portfolio: ''
  });

  // Données de démo - Normalement récupérées via API
  const project = {
    id: projectId,
    title: 'Développement API REST pour plateforme fintech',
    description: `Nous recherchons un développeur backend expérimenté pour créer une API REST sécurisée pour notre plateforme de paiement mobile.

Le projet comprend :
- Architecture microservices avec Node.js et Express
- Base de données PostgreSQL avec optimisation des requêtes
- Authentification JWT avec refresh tokens
- Intégration Stripe pour les paiements
- Documentation API complète (Swagger)
- Tests unitaires et d'intégration
- Déploiement sur AWS avec CI/CD

Profil recherché :
- Minimum 3 ans d'expérience en développement backend
- Expérience confirmée avec Node.js et PostgreSQL
- Connaissance des bonnes pratiques de sécurité (OWASP)
- Expérience en fintech fortement appréciée
- Maîtrise de Git et des méthodologies agiles

Livrables attendus :
- Code source documenté et testé
- Documentation technique complète
- Guide de déploiement
- Formation de l'équipe technique`,
    budget: { min: 20000, max: 35000 },
    duration: '4 mois',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Stripe', 'AWS'],
    client: {
      name: 'PayMaroc',
      rating: 4.9,
      projectsPosted: 8,
      memberSince: '2023-01',
      bio: 'Startup fintech marocaine spécialisée dans les solutions de paiement mobile pour les PME.',
      verifiedPayment: true
    },
    proposals: 6,
    postedAt: '2025-12-05',
    category: 'Développement Web',
    location: 'Remote (Maroc)',
    projectType: 'Fixed Price'
  };

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    alert('Votre candidature a été envoyée avec succès ! 🎉');
    setShowProposalForm(false);
    // Normalement : appel API pour envoyer la candidature
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/freelance')}
            className="text-indigo-600 hover:underline flex items-center gap-1"
          >
            ← Retour aux projets
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <span className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                {project.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💼</span>
                  <span>{project.projectType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>Publié le {new Date(project.postedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">Budget</p>
                  <p className="text-xl font-bold text-green-600">
                    {project.budget.min.toLocaleString()} - {project.budget.max.toLocaleString()} DH
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">Durée estimée</p>
                  <p className="text-xl font-bold text-blue-600">
                    {project.duration}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600">Propositions</p>
                  <p className="text-xl font-bold text-purple-600">
                    {project.proposals}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description du projet
              </h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {project.description}
              </div>
            </div>

            {/* Compétences requises */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Compétences requises
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Formulaire de candidature */}
            {showProposalForm && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Soumettre une proposition
                </h2>
                <form onSubmit={handleSubmitProposal} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lettre de motivation *
                    </label>
                    <textarea
                      required
                      value={proposal.coverLetter}
                      onChange={(e) => setProposal({...proposal, coverLetter: e.target.value})}
                      placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce projet..."
                      className="w-full h-40 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Votre budget (DH) *
                      </label>
                      <input
                        type="number"
                        required
                        value={proposal.estimatedBudget}
                        onChange={(e) => setProposal({...proposal, estimatedBudget: e.target.value})}
                        placeholder="Ex: 25000"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée estimée *
                      </label>
                      <input
                        type="text"
                        required
                        value={proposal.estimatedDuration}
                        onChange={(e) => setProposal({...proposal, estimatedDuration: e.target.value})}
                        placeholder="Ex: 3 mois"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien portfolio / GitHub
                    </label>
                    <input
                      type="url"
                      value={proposal.portfolio}
                      onChange={(e) => setProposal({...proposal, portfolio: e.target.value})}
                      placeholder="https://github.com/votre-profil"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      Envoyer ma candidature
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* CTA Postuler */}
            {!showProposalForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-4">
                <button
                  onClick={() => setShowProposalForm(true)}
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition font-bold text-lg mb-4"
                >
                  Postuler maintenant
                </button>
                <p className="text-sm text-gray-600 text-center">
                  Montrez vos compétences et décrochez ce projet
                </p>
              </div>
            )}

            {/* Info Client */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">À propos du client</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-lg">
                    {project.client.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{project.client.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{project.client.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                {project.client.bio}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projets postés</span>
                  <span className="font-medium text-gray-900">{project.client.projectsPosted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-medium text-gray-900">
                    {new Date(project.client.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {project.client.verifiedPayment && (
                  <div className="flex items-center gap-2 text-green-600 pt-2">
                    <span>✓</span>
                    <span className="text-sm font-medium">Paiement vérifié</span>
                  </div>
                )}
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="font-bold text-indigo-900 mb-3">💡 Conseils</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>• Lisez attentivement la description</li>
                <li>• Personnalisez votre candidature</li>
                <li>• Mettez en avant votre expérience</li>
                <li>• Proposez un budget réaliste</li>
                <li>• Ajoutez votre portfolio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}