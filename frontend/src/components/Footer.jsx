import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="mb-2">
          <span className="text-2xl">🎓</span> 
          <span className="font-bold ml-2">SkillUp Maroc</span>
        </p>
        <p className="text-gray-400 text-sm">
          La première plateforme marocaine complète : Formation + Certification + Freelancing
        </p>
        
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <Link to="/a-propos" className="text-gray-400 hover:text-white transition">À propos</Link>
          <Link to="/cgv" className="text-gray-400 hover:text-white transition">CGV</Link>
          <Link to="/formations" className="text-gray-400 hover:text-white transition">Formations</Link>
          <Link to="/freelance" className="text-gray-400 hover:text-white transition">Freelance</Link>
        </div>
        
        <p className="text-gray-500 text-sm mt-4">
          © 2025 SkillUp Maroc. Tous droits réservés. 🇲🇦
        </p>
      </div>
    </footer>
  );
}
