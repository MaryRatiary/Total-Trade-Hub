import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/th.png';
import Spinner from '../components/Spinner';
import { apiService } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowError(false);

    try {
      const data = await apiService.login(credentials);
      localStorage.setItem('currentUser', JSON.stringify({
        token: data.token,
        ...data.user
      }));
      navigate('/WelcomePage');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Erreur de connexion');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center relative overflow-hidden">
      
      <img src={logo} alt="TotalTradeHub Logo" className="w-40 h-auto mb-6 animate-pulse" />

      <Link
        to="/register"
        className="absolute top-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-blue-700 hover:to-cyan-500 text-white font-semibold py-2 px-5 rounded-full shadow-xl transition-all duration-300"
      >
        S'inscrire
      </Link>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 space-y-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h2 className="text-white text-3xl font-bold text-center tracking-wider">Connexion</h2>

          {showError && error && (
            <div className="relative bg-red-500/20 text-red-400 border border-red-400 px-4 py-3 rounded-md text-sm animate-fade-in">
              {error}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowError(false);
                }}
                className="absolute right-2 top-2 text-red-400 hover:text-red-600 text-lg"
              >
                ×
              </button>
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-black placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-black placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-blue-700 hover:to-cyan-500 text-white font-semibold text-lg tracking-wide transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : 'Se connecter'}
          </button>
        </form>

        {/* 🔻 Connexion alternative */}
        <div className="flex flex-col gap-3 mt-4">
          <button className="flex items-center justify-center gap-3 py-2 px-4 border border-white/20 rounded-full bg-white/5 hover:bg-white/10 transition text-white">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Se connecter avec Google
          </button>
          <button className="flex items-center justify-center gap-3 py-2 px-4 border border-white/20 rounded-full bg-white/5 hover:bg-white/10 transition text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M16.95 3a4.486 4.486 0 0 1-3.45 1.654A4.488 4.488 0 0 1 10.05 3H3v18h18V3h-4.05zM12 4.5a3 3 0 0 0 0 6 3 3 0 0 0 0-6zm0 16.5a8.5 8.5 0 0 1-8.5-8.5c0-2.33 1.033-4.41 2.663-5.85A5.47 5.47 0 0 0 5 10.5c0 3.032 2.468 5.5 5.5 5.5s5.5-2.468 5.5-5.5c0-1.413-.527-2.703-1.4-3.7A8.453 8.453 0 0 1 20.5 12a8.5 8.5 0 0 1-8.5 8.5z"/></svg>
            Se connecter avec iCloud
          </button>
        </div>

        {/* 🔻 Message en bas */}
        <p className="text-center text-sm text-gray-300 mt-4">
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">S’inscrire ici</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
