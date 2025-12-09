// src/pages/PaymentCancel.jsx
import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-8">
          Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gray-900 mb-2">Pourquoi réessayer ?</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Accès illimité au cours</li>
            <li>✓ Certificat de fin</li>
            <li>✓ Garantie satisfait ou remboursé 14 jours</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Réessayer le paiement
          </button>
          <button
            onClick={() => navigate('/formations')}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Retour aux formations
          </button>
        </div>
      </div>
    </div>
  );
}