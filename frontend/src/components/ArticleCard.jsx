import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import './ArticleCard.css';
import { API_BASE_URL } from '../services/config';
import { likeArticle, addComment, deleteComment, shareArticle, incrementViews, getViews } from '../services/articleService';

const ArticleCard = ({ article, onDelete, onEdit }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(article?.views ?? 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Stockage des données de l'article avec des valeurs par défaut sécurisées
  const articleData = {
    id: article?.id ?? '',
    title: article?.title ?? 'Sans titre',
    content: article?.content ?? '',
    price: article?.price ?? 0,
    location: article?.location ?? 'Non spécifié',
    description: article?.description ?? '',
    contact: article?.contact ?? 'Non spécifié',
    imagePath: article?.imagePath ?? '',
    authorFirstName: article?.authorFirstName ?? '',
    authorLastName: article?.authorLastName ?? '',
    authorUsername: article?.authorUsername ?? '',
    authorProfilePicture: article?.authorProfilePicture ?? '',
    createdAt: article?.createdAt ? new Date(article.createdAt) : new Date()
  };

  // Correction stricte de l'affichage du nom de l'auteur
  let displayName = "Utilisateur inconnu";
  const hasFirstName = typeof articleData.authorFirstName === "string" && articleData.authorFirstName.trim().length > 0;
  const hasLastName = typeof articleData.authorLastName === "string" && articleData.authorLastName.trim().length > 0;
  const hasUsername = typeof articleData.authorUsername === "string" && articleData.authorUsername.trim().length > 0;
  if (hasFirstName && hasLastName) {
    displayName = `${articleData.authorFirstName.trim()} ${articleData.authorLastName.trim()}`;
  } else if (hasFirstName) {
    displayName = articleData.authorFirstName.trim();
  } else if (hasLastName) {
    displayName = articleData.authorLastName.trim();
  } else if (hasUsername) {
    displayName = articleData.authorUsername.trim();
  }

  console.log('Rendering article:', { id: articleData.id, title: articleData.title, authorFirstName: articleData.authorFirstName, authorLastName: articleData.authorLastName });

  useEffect(() => {
    // Debug log pour vérifier les données reçues
    console.log("Article reçu:", {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      price: articleData.price,
      location: articleData.location,
      imagePath: articleData.imagePath,
      authorFirstName: articleData.authorFirstName,
      authorLastName: articleData.authorLastName,
      authorUsername: articleData.authorUsername,
      authorProfilePicture: articleData.authorProfilePicture
    });
  }, [article]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadViews = async () => {
      try {
        const response = await getViews(article.id);
        setViews(response.views);
      } catch (error) {
        console.error('Error loading views:', error);
      }
    };
    if (article?.id) {
      loadViews();
    }
  }, [article?.id]);

  const handleLike = async () => {
    try {
      await likeArticle(article.id);
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
    } catch (error) {
      console.error('Error liking article:', error);
      alert('Erreur lors du like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const newComment = await addComment(article.id, comment.trim());
      setComments([...comments, newComment]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleEdit = () => {
    try {
      onEdit(articleData); // Notify parent to open the edit form with article data
      setShowDropdown(false);
    } catch (error) {
      console.error('Error in handleEdit:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.token) {
        console.error('User not authenticated');
        alert('Vous devez être connecté pour effectuer cette action.');
        return;
      }

      console.log('Deleting article:', article.id);
      const response = await fetch(`${API_BASE_URL}/articles/${article.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      if (typeof onDelete === 'function') {
        onDelete(article.id); // Notify parent to remove the article from the list
      } else {
        console.error('onDelete is not a function');
      }

      alert('Article supprimé avec succès');
      setShowDropdown(false);
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert(error.message || 'Erreur lors de la suppression de l\'article');
    }
  };

  const handleView = async () => {
    try {
      await incrementViews(articleData.id);
      setViews(prev => prev + 1);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const deleteArticles = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUTES les publications ? Cette action est irréversible.')) {
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.token) {
            console.error('Utilisateur non connecté');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/articles/deleteAll`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Toutes les publications ont été supprimées');
            window.location.reload(); // Rafraîchir la page
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression des publications');
    }
};

  // Vérification que l'article existe avant le rendu
  if (!article) {
    return null;
  }

  return (
    <div className="article-card">
      {/* En-tête de la carte avec les infos utilisateur */}
      <div className="article-header">
        <div className="user-info">
          <img 
            src={articleData.authorProfilePicture || '/default-avatar.png'} 
            alt={displayName}
            className="user-avatar"
          />
          <div className="user-details">
            <span className="username">{displayName}</span>
            <span className="location">{articleData.location || 'Emplacement non spécifié'}</span>
          </div>
        </div>
        <div className="more-options cursor-poi" ref={dropdownRef}>
          <button onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>•••</button>
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleView}>
                <FaEye /> Voir
              </div>
              <div className="dropdown-item" onClick={handleEdit}>
                <FaEdit /> Modifier
              </div>
              <div className="dropdown-item delete" onClick={handleDelete}>
                <FaTrash /> Supprimer
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image de l'article */}
      {articleData.imagePath && (
        <div className="article-image">
          <img
            src={articleData.imagePath}
            alt={articleData.title || 'Image article'}
            onError={(e) => e.target.src = '/placeholder.jpg'}
          />
        </div>
      )}

      {/* Barre d'actions */}
      <div className="action-bar">
        <div className="left-actions">
          <button onClick={handleLike} className="action-button">
            {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="action-button">
            <FaComment />
          </button>
          <button className="action-button" onClick={async () => {
            try {
              await shareArticle(article.id);
              alert('Article partagé avec succès');
            } catch (error) {
              console.error('Error sharing article:', error);
              alert('Erreur lors du partage');
            }
          }}>
            <FaShare />
          </button>
        </div>
        <button onClick={() => setIsSaved(!isSaved)} className="action-button">
          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      {/* Compteur de likes */}
      <div className="likes-count">
        {likes} j'aime
      </div>

      {/* Compteur de vues */}
      <div className="views-count">
        {views} vues
      </div>

      {/* Contenu de l'article */}
      <div className="article-content">
        <h3 className="article-title">{articleData.title}</h3>
        <div className="article-details">
          <p className="article-description">{articleData.description}</p>
          <p className="article-price">
            {articleData.price ? `${new Intl.NumberFormat('fr-FR').format(articleData.price)} Ar` : 'Prix non spécifié'}
          </p>
          <p className="article-contact">{articleData.contact ? `📞 ${articleData.contact}` : 'Contact non spécifié'}</p>
          <p className="article-date">
            {articleData.createdAt ? new Date(articleData.createdAt).toLocaleDateString('fr-FR') : ''}
          </p>
        </div>
      </div>

      {/* Section commentaires */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-content">
                  <img 
                    src={comment.authorProfilePicture || '/default-avatar.png'} 
                    alt={comment.authorUsername}
                    className="comment-avatar"
                  />
                  <div className="comment-details">
                    <span className="comment-username">{comment.authorUsername}</span>
                    <span className="comment-text">{comment.content}</span>
                  </div>
                </div>
                {comment.userId === localStorage.getItem('userId') && (
                  <button 
                    onClick={async () => {
                      try {
                        await deleteComment(article.id, comment.id);
                        setComments(comments.filter(c => c.id !== comment.id));
                      } catch (error) {
                        console.error('Error deleting comment:', error);
                        alert('Erreur lors de la suppression du commentaire');
                      }
                    }} 
                    className="delete-comment-btn"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-submit">Publier</button>
          </form>
        </div>
      )}
     
    </div>
  );
};

export default ArticleCard;
