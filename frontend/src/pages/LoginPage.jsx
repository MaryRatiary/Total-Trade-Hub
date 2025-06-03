import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '/tth-removebg.png';
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
    <div className='aito relative ' >
      <img src={logo} alt="TotalTradeHub Logo" className='relative w-50 h-50'/>
      <article>
        <Link
          className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          to="/register"
        >
          S'inscrire
        </Link>
      </article>
 
      <div className="login-container absolute w-full">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className='bolde font-size-[40px]'>Connexion</h2>
          {showError && error && (
            <div className="error-message" onClick={() => setShowError(false)}>
              {error}
              <button 
                className="close-error"
                onClick={(e) => {
                  e.preventDefault();
                  setShowError(false);
                }}
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
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
