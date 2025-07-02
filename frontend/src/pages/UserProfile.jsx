import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { FaCamera, FaEdit } from 'react-icons/fa';
import { API_BASE_URL } from '../services/config';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const { userId } = useParams();
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);
  const [previousPhotos, setPreviousPhotos] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null); // 'pending', 'accepted', null
  const [coverHovered, setCoverHovered] = useState(false);

  const loadUserProfile = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const endpoint = userId ? `${API_BASE_URL}/users/${userId}` : `${API_BASE_URL}/users/profile`;
      setIsOwnProfile(!userId);
      
      console.log('Fetching profile from:', endpoint);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('currentUser');
        navigate('/login');
        return;
      }

      const data = await response.json();
      console.log('Profile data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching profile');
      }

      setUser({
        ...data,
        FirstName: data.firstName || data.FirstName,
        LastName: data.lastName || data.LastName,
        Email: data.email || data.Email,
        Phone: data.phone || data.Phone,
        Residence: data.residence || data.Residence,
        ProfilePicture: data.profilePicture || data.ProfilePicture,
        CoverPicture: data.coverPicture || data.CoverPicture,
        Articles: data.articles || data.Articles || []
      });

      // Fetch friends count
      const friendsResponse = await fetch(`${API_BASE_URL}/friendrequest/friends`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (friendsResponse.ok) {
        const { count } = await friendsResponse.json();
        setFriendsCount(count);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/photos`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPreviousPhotos(data);
      }
    } catch (error) {
      console.error('Error loading previous photos:', error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        }
      });
      if (response.ok) {
        loadPreviousPhotos();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleSelectPhoto = async (photoUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/profile-picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photoUrl })
      });
      if (response.ok) {
        setUser(prev => ({ ...prev, ProfilePicture: photoUrl }));
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleCoverPictureChange = async (event) => {
    if (!isOwnProfile) return;
    
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.token) {
          throw new Error('Non authentifié');
        }

        console.log('Uploading cover picture...');
        const response = await fetch(`${API_BASE_URL}/user/cover-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
            'Accept': 'application/json'
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server response:', errorData);
          throw new Error(errorData.message || 'Failed to upload cover picture');
        }

        const result = await response.json();
        console.log('Server response:', result);
        
        if (result.coverPictureUrl) {
          // Mettre à jour l'état avec la nouvelle URL
          const newUrl = result.coverPictureUrl;
          console.log('Updating cover picture URL to:', newUrl);
          
          setUser(prev => ({
            ...prev,
            CoverPicture: newUrl
          }));

          // Force le rechargement de l'image
          const coverImg = document.querySelector('.profile-cover img');
          if (coverImg) {
            coverImg.src = newUrl + '?t=' + new Date().getTime();
          }
          
          event.target.value = '';
          console.log('Cover picture updated successfully:', result.message);
        }
      } catch (error) {
        console.error('Error uploading cover picture:', error);
        alert('Erreur lors du téléchargement de la photo de couverture : ' + error.message);
      }
    }
  };

  useEffect(() => {
    loadUserProfile();
    checkFriendshipStatus();
  }, [userId, navigate]);

  const checkFriendshipStatus = async () => {
    if (!userId) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/friendrequest/friends`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { friends } = await response.json();
        if (friends.some(friend => friend.id === userId)) {
          setFriendRequestStatus('accepted');
        } else {
          // Vérifier s'il y a une demande en attente
          const pendingResponse = await fetch(`${API_BASE_URL}/friendrequest/pending`, {
            headers: {
              'Authorization': `Bearer ${currentUser.token}`,
              'Content-Type': 'application/json'
            }
          });

          if (pendingResponse.ok) {
            const pendingRequests = await pendingResponse.json();
            if (pendingRequests.some(req => req.senderId === userId || req.receiverId === userId)) {
              setFriendRequestStatus('pending');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) {
      navigate('/login');
      return;
    }

    try {
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
        setFriendRequestStatus('pending');
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    if (!isOwnProfile) return;
    
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file, file.name);

      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload profile picture');
        }

        const result = await response.json();
        if (result.profilePictureUrl) {
          setUser(prev => ({
            ...prev,
            ProfilePicture: result.profilePictureUrl
          }));
          // Clear file input
          event.target.value = '';
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 max-w-5xl mt-6">
          <div className="profile-header-section">
            {/* Skeleton Cover */}
            <div className="skeleton skeleton-cover"></div>
            
            {/* Skeleton Profile Info */}
            <div className="relative">
              {/* Skeleton Avatar */}
              <div className="skeleton skeleton-avatar"></div>
              
              <div className="profile-info">
                {/* Skeleton Name and Status */}
                <div className="skeleton skeleton-text title"></div>
                <div className="skeleton skeleton-text subtitle"></div>
                
                {/* Skeleton Description */}
                <div className="skeleton skeleton-text" style={{width: "60%"}}></div>
                <div className="skeleton skeleton-text" style={{width: "40%"}}></div>
              </div>
              
              {/* Skeleton Tabs */}
              <div className="profile-tabs">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton skeleton-text" style={{width: "80px", height: "20px"}}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 max-w-7xl mt-8 ">
        {user ? (
          <div className="profile-header-section">
            {/* Cover Photo */}
            <div className="profile-cover">
              <img
                src={user.CoverPicture}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <div className="cover-overlay">
                  <button
                    onClick={() => coverFileInputRef.current.click()}
                    className="cover-edit-button"
                  >
                    <FaCamera /> Modifier la photo de couverture
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={coverFileInputRef}
                className="hidden"
                onChange={handleCoverPictureChange}
                accept="image/*"
              />
            </div>

            {/* Profile Info Section */}
            <div className="relative">
              {/* Profile Picture */}
              <div className="profile-picture-container">
                <img
                  src={user.ProfilePicture || '/default-avatar.png'}
                  alt={`${user.FirstName} ${user.LastName}`}
                  className="w-full h-full object-cover"
                />
                {isOwnProfile && (
                  <>
                    <div className="picture-edit-overlay" onClick={() => fileInputRef.current.click()}>
                      <FaCamera color="white" size={24} />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="profile-info">
                <div className="profile-header">
                  <div>
                    <h1 className="profile-name">{user.FirstName} {user.LastName}</h1>
                    <p className="profile-subtitle">{friendsCount} amis</p>
                  </div>
                  {!isOwnProfile && (
                    <div className="profile-actions">
                      <div className="flex gap-2">
                        {friendRequestStatus === 'accepted' ? (
                          <>
                            <button className="friend-button secondary" disabled>
                              Amis
                            </button>
                            <button
                              onClick={() => navigate(`/messages/${userId}`)}
                              className="friend-button primary"
                            >
                              Envoyer un message
                            </button>
                          </>
                        ) : friendRequestStatus === 'pending' ? (
                          <button className="friend-button secondary" disabled>
                            Demande envoyée
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleSendFriendRequest}
                              className="friend-button primary"
                            >
                              Ajouter en ami
                            </button>
                            <button
                              onClick={() => navigate(`/messages/${userId}`)}
                              className="friend-button secondary"
                            >
                              Envoyer un message
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                  <div className="profile-tab active">Publications</div>
                  <div className="profile-tab">À propos</div>
                  <div className="profile-tab">Amis</div>
                  <div className="profile-tab">Photos</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Articles Grid */}
        {user?.Articles && user.Articles.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.Articles.map(article => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={article.imagePath || '/placeholder.jpg'}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{article.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">
                        {article.price ? `${new Intl.NumberFormat('fr-FR').format(article.price)} Ar` : 'Prix non spécifié'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
