import React from 'react';
import { FaBirthdayCake, FaUserPlus } from 'react-icons/fa';

const RightSidebar = ({ contacts, birthdays, suggestions }) => {
  return (
    <div className="min-h-screen bg-white rounded-lg shadow-md flex flex-col gap-6 fixed mt-[90px] p-4" style={{ width: '350px', borderLeft: '1px solid #e5e7eb' }}>
      {birthdays && birthdays.length > 0 && (
        <div className="mb-6">
          <h3 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <FaBirthdayCake />
            Anniversaires
          </h3>
          {birthdays.map((birthday, index) => (
            <div key={birthday.Id || birthday.id || `birthday-${index}`} className="text-gray-700 mb-1">
              <span className="font-medium">{birthday.Name || birthday.name}</span> fête son anniversaire aujourd'hui
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-green-600 font-semibold mb-2">Suggestions d'amis</h3>
        <div className="flex flex-col gap-2">
          {suggestions?.map((contact, index) => (
            <div key={contact.Id || contact.id || `suggestion-${index}`} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-all duration-200 ease-in-out">
              <img
                src={contact.ProfilePicture || contact.profilePicture || '/default-avatar.png'}
                alt={`${contact.FirstName || contact.firstName || ''} ${contact.LastName || contact.lastName || ''}`}
                className="w-10 h-10 rounded-full object-cover border"
                style={{ borderColor: '#3b82f6', borderWidth: '2px' }}
              />
              <span className="flex-1 text-gray-800 font-medium">{contact.FirstName || contact.firstName} {contact.LastName || contact.lastName}</span>
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 ease-in-out">
                <FaUserPlus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-indigo-600 font-semibold mb-2">Contacts</h3>
        <div className="flex flex-col gap-2">
          {contacts?.map((contact, index) => (
            <div key={contact.Id || contact.id || `contact-${index}`} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-all duration-200 ease-in-out">
              <div className="relative">
                <img
                  src={contact.ProfilePicture || contact.profilePicture || '/default-avatar.png'}
                  alt={`${contact.FirstName || contact.firstName || ''} ${contact.LastName || contact.lastName || ''}`}
                  className="w-10 h-10 rounded-full object-cover border"
                  style={{ borderColor: contact.online ? '#34d399' : '#e5e7eb', borderWidth: '2px' }}
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </div>
              <span className="ml-2 text-gray-800 font-medium">{contact.FirstName || contact.firstName} {contact.LastName || contact.lastName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;

