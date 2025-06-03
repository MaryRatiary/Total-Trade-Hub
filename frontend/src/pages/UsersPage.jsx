import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { API_BASE_URL } from '../services/config';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/list`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des utilisateurs: ${response.status}`);
        }

        const data = await response.json();
        console.log('Users data:', data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/friendrequest/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: userId
        })
      });

      if (response.ok) {
        alert('Demande d\'ami envoyée avec succès');
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'envoi de la demande d\'ami');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Erreur lors de l\'envoi de la demande d\'ami');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erreur! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold mb-8 text-center">Utilisateurs</h1>
        {users.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div key={user.Id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={user.ProfilePicture || "/default-avatar.png"}
                    alt={`${user.FirstName} ${user.LastName}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white text-xl font-semibold">
                      {user.FirstName} {user.LastName}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-gray-600">
                      <i className="fas fa-envelope mr-2"></i> {user.Email}
                    </p>
                    <p className="text-gray-600">
                      <i className="fas fa-phone mr-2"></i> {user.Phone || 'Non renseigné'}
                    </p>
                    <p className="text-gray-600">
                      <i className="fas fa-map-marker-alt mr-2"></i> {user.Residence || 'Non renseigné'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleViewProfile(user.Id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    >
                      Voir le profil
                    </button>
                    <button
                      onClick={() => handleSendFriendRequest(user.Id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
                    >
                      Ajouter en ami
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
