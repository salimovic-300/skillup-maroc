import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">À propos de SkillUp Maroc</h1>
          <p className="text-xl text-white/80">La plateforme d'apprentissage en ligne 100% marocaine</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">�� Notre Mission</h2>
          <p className="text-gray-600 leading-relaxed">SkillUp Maroc rend l'éducation de qualité accessible à tous les Marocains.</p>
        </section>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-3xl mb-3">🇲🇦</div><h3 className="font-semibold">100% Marocain</h3></div>
          <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-3xl mb-3">💰</div><h3 className="font-semibold">Prix accessibles</h3></div>
          <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-3xl mb-3">🎓</div><h3 className="font-semibold">Experts locaux</h3></div>
          <div className="bg-white p-6 rounded-xl shadow-sm"><div className="text-3xl mb-3">📱</div><h3 className="font-semibold">Apprenez partout</h3></div>
        </div>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📧 Contact</h2>
          <p className="text-gray-600">Email : contact@skillupmaroc.ma</p>
          <p className="text-gray-600">WhatsApp : +212 6XX XX XX XX</p>
        </section>
        <div className="text-center">
          <Link to="/formations" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700">Découvrir nos formations</Link>
        </div>
      </div>
    </div>
  );
}
