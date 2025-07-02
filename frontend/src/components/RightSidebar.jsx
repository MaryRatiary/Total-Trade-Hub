import React from 'react';
import { FaBirthdayCake, FaUserPlus } from 'react-icons/fa';
import './RightSidebar.css'; // Ajout du fichier CSS

const RightSidebar = ({ contacts, birthdays, suggestions }) => {
  return (
    <div className="right-sidebar-custom right-1.5 hidden lg:block p-4 bg-white rounded-lg shadow-md space-y-6 mt-[90px]">
      {birthdays && birthdays.length > 0 && (
        <div className="sidebar-section">
          <h3 className="section-title flex items-center gap-2 text-blue-600 font-semibold mb-2">
            <FaBirthdayCake />
            Anniversaires
          </h3>
          {birthdays.map(birthday => (
            <div key={birthday.id} className="birthday-item text-gray-700 mb-1">
              <span className="font-medium">{birthday.name}</span> fête son anniversaire aujourd'hui
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-section">
        <h3 className="section-title text-green-600 font-semibold mb-2">Suggestions d'amis</h3>
        <div className="contacts-list space-y-2">
          {suggestions?.map(contact => (
            <div key={contact.id} className="contact-item flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <img
                src={contact.profilePicture || '/default-avatar.png'}
                alt={`${contact.firstName || ''} ${contact.lastName || ''}`}
                className="w-8 h-8 rounded-full object-cover border"
              />
              <span className="flex-1 text-gray-800">{contact.firstName} {contact.lastName}</span>
              <button className="add-friend-btn bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full">
                <FaUserPlus />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title text-indigo-600 font-semibold mb-2">Contacts</h3>
        <div className="contacts-list space-y-2">
          {contacts?.map(contact => (
            <div key={contact.id} className="contact-item flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <div className="relative">
                <img
                  src={contact.profilePicture || '/default-avatar.png'}
                  alt={`${contact.firstName || ''} ${contact.lastName || ''}`}
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <span className={`status-dot absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </div>
              <span className="ml-2 text-gray-800">{contact.firstName} {contact.lastName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;

