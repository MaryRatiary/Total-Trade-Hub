import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaBookmark, FaUsers, FaClock, FaStore, FaCalendarAlt, FaEnvelope, FaHome } from 'react-icons/fa';

const LeftSidebar = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  return (
    <div className="!fixed left-sidebar hidden lg:flex flex-col bg-white shadow-md rounded-lg p-4 w-64 min-h-screen space-y-2 mt-[10px]" style={{ borderRight: '1px solid #e5e7eb' }}>
      <Link
        to="/profile"
        className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-50 transition"
      >
        <img
          src={currentUser?.profilePicture || '/default-avatar.png'}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover border-2"
          style={{ borderColor: '#3b82f6', borderWidth: '2px' }}
        />
        <span className="font-semibold text-gray-800">{currentUser?.firstName} {currentUser?.lastName}</span>
      </Link>

      <div className="flex flex-col mt-4 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-50 transition"
        >
          <FaHome className="text-blue-500" />
          <span className="text-gray-700">Accueil</span>
        </Link>

        <Link
          to="/users"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-50 transition"
        >
          <FaUsers className="text-blue-500" />
          <span className="text-gray-700">Ami(e)s</span>
        </Link>

        <Link
          to="/calendar"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-purple-50 transition"
        >
          <FaClock className="text-purple-500" />
          <span className="text-gray-700">Souvenirs</span>
        </Link>

        <Link
          to="/ejery"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-red-50 transition"
        >
          <FaBookmark className="text-red-500" />
          <span className="text-gray-700">Enregistrements</span>
        </Link>

        <Link
          to="/groups"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-green-50 transition"
        >
          <FaUsers className="text-green-500" />
          <span className="text-gray-700">Groupes</span>
        </Link>

        <Link
          to="/marketplace"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-blue-50 transition"
        >
          <FaStore className="text-blue-500" />
          <span className="text-gray-700">Marketplace</span>
        </Link>

        <Link
          to="/messages"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-yellow-50 transition"
        >
          <FaEnvelope className="text-yellow-500" />
          <span className="text-gray-700">Messages</span>
        </Link>

        <Link
          to="/settings"
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition"
        >
          <FaUser className="text-gray-500" />
          <span className="text-gray-700">Paramètres</span>
        </Link>
      </div>
    </div>
  );
};

export default LeftSidebar;
