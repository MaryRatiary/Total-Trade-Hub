import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
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
      message: 'Format d\'email invalide'
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
    try {
      if (!validate(formData)) {
        showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
      }

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
    }
  };

  const renderField = (id, label, type = 'text', options = null) => (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}
      </label>
      {options ? (
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id={id}
          value={formData[id]}
          onChange={handleChange}
        >
          <option value="">Sélectionnez un lieu</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors[id] ? 'border-red-500' : ''
          }`}
          id={id}
          type={type}
          value={formData[id]}
          onChange={handleChange}
        />
      )}
      {errors[id] && (
        <p className="text-red-500 text-xs italic">{errors[id]}</p>
      )}
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
    <div className="baky flex items-center justify-center min-h-screen register-bg">
      {isLoading && <LoadingOverlay message="Création de votre compte..." />}
      
      <Link
        className="absolute top-4 right-4 bg-gradient-to-l from-lime-200 to-lime-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline shadow-lg"
        to="/"
      >
        Se connecter
      </Link>
      
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 register-card">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-neutral-600 tracking-tight">Créer un compte</h2>
        <form onSubmit={e => e.preventDefault()}>
          {renderField('firstName', 'Prénom')}
          {renderField('lastName', 'Nom')}
          {renderField('email', 'Email', 'email')}
          {renderField('phone', 'Numéro de téléphone', 'tel')}
          {renderField('birthdate', 'Date de naissance', 'date')}
          {renderField('residence', 'Résidence', 'select', residenceOptions)}
          {renderField('password', 'Mot de passe', 'password')}
          {renderField('confirmPassword', 'Confirmer le mot de passe', 'password')}
          
          <div className="flex items-center justify-center mt-6">
            <button
              className="bg-gradient-to-l from-sky-200 to-lime-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 w-full flex items-center justify-center shadow-md"
              type="submit"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Inscription en cours...
                </>
              ) : (
                'S\'inscrire'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Register = () => {
  return (
    <ErrorBoundary>
      <RegisterContent />
    </ErrorBoundary>
  );
};

export default Register;