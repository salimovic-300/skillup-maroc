// src/pages/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement réussi ! 🎉
        </h1>
        <p className="text-gray-600 mb-8">
          Félicitations ! Vous êtes maintenant inscrit au cours. Vous pouvez commencer à apprendre immédiatement.
        </p>

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">ID de transaction</p>
            <p className="text-sm font-mono text-gray-700 break-all">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Aller au Dashboard
          </button>
          <button
            onClick={() => navigate('/formations')}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Découvrir d'autres cours
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Redirection automatique dans 5 secondes...
        </p>
      </div>
    </div>
  );
}