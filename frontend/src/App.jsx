import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import FaceRecognition from './pages/FaceRecognition';
import AccountCreation from './pages/AccountCreation';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import UsersPage from './pages/UsersPage';
import Calendar from './pages/Calendar';
import MessagesPage from './pages/MessagesPage';
import EJeryPage from './pages/EJeryPage';
import EditProfile from './components/EditProfile';

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/WelcomePage" element={<WelcomePage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/face-recognition" element={<FaceRecognition />} />
          <Route path="/account-creation" element={<AccountCreation />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/calendar" element={<Calendar/>}/>
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/ejery" element={<EJeryPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;