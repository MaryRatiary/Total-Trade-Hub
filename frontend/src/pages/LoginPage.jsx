import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/th.png'; // Assurez-vous que le chemin est correct
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
    <div className='aito relative bg-gradient-to-l from-gray-400 to-slate-500 ' >
      
      <img src={logo} alt="TotalTradeHub Logo" className='relative w-60 h-40'/>
      <article>
        <Link
          className="absolute top-[40px] right-[40px] bg-gradient-to-l from-sky-400 to-sky-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl focus:outline-none focus:shadow-outline"
          to="/register"
        >
          S'inscrire
        </Link>
      </article>
 
      <div className=" login-container absolute w-full bg-gradient-to-l  from-gray-400 to-slate-500">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className='bolde font-size-[200px]'>Connexion</h2>
          
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
          className='!bg-gradient-to-r from-gray-50 to-gray-200'
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
            disabled={isLoading}
            
          />
          <input
           className='!bg-gradient-to-r from-gray-50 to-gray-200'
            type="password"
            placeholder="Mot de passe"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            disabled={isLoading}
          />
          <button className='bg-gradient-to-l from-sky-400 to-sky-700 rounded-3xl' type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
