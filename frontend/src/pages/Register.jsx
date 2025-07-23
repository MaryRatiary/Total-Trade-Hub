import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorBoundary from '../components/ErrorBoundary';
import useFormValidation from '../hooks/useFormValidation';
import Spinner from '../components/Spinner';

const RegisterContent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
    residence: '',
    password: '',
    confirmPassword: ''
  });

  const validationRules = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Format d'email invalide"
    },
    phone: { required: true },
    birthdate: { required: true },
    residence: { required: true },
    password: {
      required: true,
      minLength: 6,
      message: 'Le mot de passe doit contenir au moins 6 caractères'
    },
    confirmPassword: {
      required: true,
      match: 'password',
      message: 'Les mots de passe ne correspondent pas'
    }
  };

  const { errors, validate, clearErrors } = useFormValidation(validationRules);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    clearErrors();
  };

  const handleRegister = async () => {
    if (!validate(formData)) {
      showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : new Date().toISOString(),
        residence: formData.residence,
        password: formData.password
      };

      await apiService.register(userData);
      showToast('Compte créé avec succès!', 'success');
      localStorage.setItem('userEmail', userData.email);
      navigate('/face-recognition');
    } catch (error) {
      showToast(error.message || 'Erreur lors de l\'inscription', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (id, label, type = 'text', options = null) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-white text-sm font-medium mb-2">
        {label}
      </label>
      {options ? (
        <select
          id={id}
          value={formData[id]}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Sélectionnez un lieu</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="text-black">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={formData[id]}
          onChange={handleChange}
          className={`w-full px-4 py-2 rounded-lg bg-white/10 border ${
            errors[id] ? 'border-red-500' : 'border-white/30'
          } text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
        />
      )}
      {errors[id] && <p className="text-red-400 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  const residenceOptions = [
    { value: 'antananarivo', label: 'Antananarivo' },
    { value: 'toamasina', label: 'Toamasina' },
    { value: 'fianarantsoa', label: 'Fianarantsoa' },
    { value: 'mahajanga', label: 'Mahajanga' },
    { value: 'toliara', label: 'Toliara' },
    { value: 'antsiranana', label: 'Antsiranana' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 relative">
      {isLoading && <LoadingOverlay message="Création de votre compte..." />}

      <Link
        to="/"
        className="absolute top-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-blue-700 hover:to-cyan-500 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition"
      >
        Se connecter
      </Link>

      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Créer un compte</h2>
        <form onSubmit={e => e.preventDefault()}>
          {renderField('firstName', 'Prénom')}
          {renderField('lastName', 'Nom')}
          {renderField('email', 'Email', 'email')}
          {renderField('phone', 'Numéro de téléphone', 'tel')}
          {renderField('birthdate', 'Date de naissance', 'date')}
          {renderField('residence', 'Résidence', 'select', residenceOptions)}
          {renderField('password', 'Mot de passe', 'password')}
          {renderField('confirmPassword', 'Confirmer le mot de passe', 'password')}

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-blue-700 hover:to-cyan-500 text-white font-semibold transition-all duration-300 flex justify-center items-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Spinner size="small" className="mr-2" />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-6">
          Vous avez déjà un compte ?{' '}
          <Link to="/" className="text-cyan-400 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

const Register = () => (
  <ErrorBoundary>
    <RegisterContent />
  </ErrorBoundary>
);

export default Register;
