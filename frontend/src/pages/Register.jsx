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
    <div className="baky flex items-center justify-center min-h-screen bg-#1f2937">
      {isLoading && <LoadingOverlay message="Création de votre compte..." />}
      
      <Link
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        to="/"
      >
        Se connecter
      </Link>
      
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">S'inscrire</h2>
        <form onSubmit={e => e.preventDefault()}>
          {renderField('firstName', 'Prénom')}
          {renderField('lastName', 'Nom')}
          {renderField('email', 'Email', 'email')}
          {renderField('phone', 'Numéro de téléphone', 'tel')}
          {renderField('birthdate', 'Date de naissance', 'date')}
          {renderField('residence', 'Résidence', 'select', residenceOptions)}
          {renderField('password', 'Mot de passe', 'password')}
          {renderField('confirmPassword', 'Confirmer le mot de passe', 'password')}
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 flex items-center justify-center"
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