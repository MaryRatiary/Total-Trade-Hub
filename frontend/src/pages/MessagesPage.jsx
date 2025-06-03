import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MessagesPage.css';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { API_BASE_URL } from '../services/config';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchFriendsAndConversations();
  }, [navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return {
      headers: {
        'Authorization': `Bearer ${currentUser?.token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const getCurrentUser = () => {
    try {
      const userString = localStorage.getItem('currentUser');
      if (!userString) {
        console.error('No user found in localStorage');
        return null;
      }
      const user = JSON.parse(userString);
      if (!user) {
        console.error('Invalid user data in localStorage');
        return null;
      }
      // Handle both lowercase and uppercase ID field
      const userId = user.id || user.Id;
      if (!userId) {
        console.error('Invalid user data in localStorage:', user);
        return null;
      }
      return {
        ...user,
        id: userId // Normalize to lowercase for consistency
      };
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  const fetchFriendsAndConversations = async () => {
    try {
      setLoading(true);
      const friendsResponse = await axios.get(`${API_BASE_URL}/friendrequest/friends`, getAuthHeaders());
      setFriends(friendsResponse.data.friends);

      const conversationsResponse = await axios.get(`${API_BASE_URL}/message/conversations`, getAuthHeaders());
      setConversations(conversationsResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/message/messages/${otherUserId}`,
        getAuthHeaders()
      );
      console.log('Messages reçus:', response.data);
      setMessages(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const normalizeMessage = (message) => {
    const normalized = {
      id: (message.Id || message.id || '').toString(),
      senderId: (message.SenderId || message.senderId || '').toString(),
      receiverId: (message.ReceiverId || message.receiverId || '').toString(),
      content: message.Content || message.content || '',
      createdAt: message.CreatedAt || message.createdAt
    };
    console.log('Normalized message:', normalized);
    return normalized;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const response = await axios.post(
        `${API_BASE_URL}/message/send`,
        {
          receiverId: selectedConversation.id,
          content: message
        },
        getAuthHeaders()
      );

      const normalizedMessage = normalizeMessage(response.data);
      // Vérifier que l'ID de l'expéditeur est correctement défini
      if (!normalizedMessage.senderId) {
        normalizedMessage.senderId = currentUser.id;
      }
      setMessages(prevMessages => [...prevMessages, normalizedMessage]);
      setMessage('');
      
      // Mise à jour de la conversation sans re-fetch complet
      const updatedConversation = {
        ...selectedConversation,
        lastMessage: message,
        lastMessageTime: new Date().toISOString()
      };
      
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id ? updatedConversation : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const startNewConversation = (friend) => {
    const existingConversation = conversations.find(conv => conv.id === friend.id);
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      setSelectedConversation({
        id: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        profilePicture: friend.profilePicture,
        lastMessage: null,
        unreadCount: 0
      });
    }
    setShowNewMessageModal(false);
  };

  const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const now = new Date();
    
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Hier à ${messageDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    return messageDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '';
      }
      
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toLocaleDateString() === now.toLocaleDateString()) {
        return date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      if (date.toLocaleDateString() === yesterday.toLocaleDateString()) {
        return `Hier, ${date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}`;
      }
      
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.firstName + ' ' + conv.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFriends = friends.filter(friend =>
    (friend.firstName + ' ' + friend.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="conversations-list">
          <div className="conversations-header">
            <h2>Discussions</h2>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="new-message-button"
            >
              Nouveau message
            </button>
          </div>
          
          <div className="message-search-bar">
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="message-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="conversations-container">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <img
                  src={conv.profilePicture || '/default-avatar.png'}
                  alt={`${conv.firstName} ${conv.lastName}`}
                  className="conversation-avatar"
                />
                <div className="conversation-info">
                  <h3>{conv.firstName} {conv.lastName}</h3>
                  <p className="last-message">
                    {conv.lastMessage || 'Démarrer une conversation'}
                    {conv.unreadCount > 0 && <span className="unread-count">{conv.unreadCount}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <img
                  src={selectedConversation.profilePicture || '/default-avatar.png'}
                  alt={`${selectedConversation.firstName} ${selectedConversation.lastName}`}
                  className="chat-avatar"
                />
                <h3>{selectedConversation.firstName} {selectedConversation.lastName}</h3>
              </div>
              
              <div className="messages-container">
                {messages && messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const currentUser = getCurrentUser();
                    if (!currentUser) {
                      console.error('Unable to determine message direction: no current user');
                      return null;
                    }
                    const normalizedMsg = normalizeMessage(msg);
                    // Compare string versions of IDs to ensure consistent comparison
                    const isSent = normalizedMsg.senderId.toString() === currentUser.id.toString();
                    
                    return (
                      <div
                        key={`${normalizedMsg.id || 'msg'}-${index}`}
                        className={`message ${isSent ? 'sent' : 'received'}`}
                      >
                        <div className="message-text">{normalizedMsg.content}</div>
                        <div className="message-time">
                          {formatTime(normalizedMsg.createdAt)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Commencez la conversation...
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="message-input"
                />
                <button type="submit" className="send-button">
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Sélectionnez une conversation pour commencer à discuter
            </div>
          )}
        </div>

        {showNewMessageModal && (
          <div className="new-message-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Nouveau message</h3>
                <button onClick={() => setShowNewMessageModal(false)} className="close-button">
                  &times;
                </button>
              </div>
              <div className="modal-search">
                <input
                  type="text"
                  placeholder="Rechercher un ami..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="message-search-input"
                />
              </div>
              <div className="friends-list">
                {filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    className="friend-item"
                    onClick={() => startNewConversation(friend)}
                  >
                    <img
                      src={friend.profilePicture || '/default-avatar.png'}
                      alt={`${friend.firstName} ${friend.lastName}`}
                      className="friend-avatar"
                    />
                    <div className="friend-info">
                      <h4>{friend.firstName} {friend.lastName}</h4>
                      <p className="username">@{friend.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesPage;