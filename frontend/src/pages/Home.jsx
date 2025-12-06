// src/pages/Home.jsx
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-sm font-medium px-4 py-2 rounded-full mb-6">
              🚀 La plateforme #1 au Maroc
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Formez-vous.<br />
              Certifiez-vous.<br />
              <span className="text-yellow-300">Travaillez.</span>
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              La première plateforme marocaine qui combine formation de qualité, 
              certification reconnue et opportunités freelance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/formations" 
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Explorer les formations →
              </Link>
              <Link 
                to="/inscription" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">10K+</p>
              <p className="text-gray-600">Étudiants formés</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">50+</p>
              <p className="text-gray-600">Formations</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">500+</p>
              <p className="text-gray-600">Projets freelance</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">4.9/5</p>
              <p className="text-gray-600">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Pourquoi choisir <span className="text-indigo-600">SkillUp Maroc</span> ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète conçue pour le marché marocain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                emoji: '🎓',
                title: 'Formations Certifiantes',
                description: 'Des cours créés par des experts marocains et internationaux'
              },
              {
                emoji: '💼',
                title: 'Marketplace Freelance',
                description: 'Trouvez des missions ou recrutez des talents qualifiés'
              },
              {
                emoji: '🏆',
                title: 'Garantie Emploi',
                description: 'Parcours premium avec garantie de placement'
              },
              {
                emoji: '📈',
                title: 'Suivi Personnalisé',
                description: 'Accompagnement individuel et communauté active'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-12 text-center">
            Explorez nos catégories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Développement Web', count: 15, emoji: '💻' },
              { name: 'Design & UI/UX', count: 8, emoji: '🎨' },
              { name: 'Marketing Digital', count: 12, emoji: '📈' },
              { name: 'Data Science', count: 6, emoji: '📊' },
              { name: 'Business', count: 10, emoji: '💼' },
              { name: 'Langues', count: 5, emoji: '🌍' },
            ].map((cat, index) => (
              <div
                key={index}
                className="bg-gray-50 hover:bg-indigo-50 rounded-xl p-6 text-center transition-colors cursor-pointer"
              >
                <span className="text-4xl mb-3 block">{cat.emoji}</span>
                <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.count} cours</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Prêt à booster votre carrière ?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Rejoignez plus de 10,000 étudiants qui ont déjà transformé leur carrière
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/inscription" 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Commencer gratuitement
            </Link>
            <Link 
              to="/formations" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10"
            >
              Découvrir les formations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}