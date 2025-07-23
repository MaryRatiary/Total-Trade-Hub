
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { FaComment, FaShare, FaBookmark, FaRegBookmark, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import './ArticleCard.css';
import { API_BASE_URL } from '../services/config';
import { likeArticle, addComment, deleteComment, shareArticle, incrementViews, getViews } from '../services/articleService';

const ArticleCard = ({ article, onDelete, onEdit }) => {
  const [vote, setVote] = useState(0); // 1 = up, -1 = down, 0 = neutre
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [votesCount, setVotesCount] = useState(0);
  const [views, setViews] = useState(article?.views ?? 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showLightbox, setShowLightbox] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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


  // Simule un vote up/down (à remplacer par appel API si besoin)
  const handleVote = async (direction) => {
    if (vote === direction) {
      setVote(0);
      setVotesCount(votesCount - direction);
    } else {
      setVotesCount(votesCount - vote + direction);
      setVote(direction);
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
      onEdit(articleData);
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
        alert('Vous devez être connecté pour effectuer cette action.');
        return;
      }

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
        onDelete(article.id);
      }

      alert('Article supprimé avec succès');
      setShowDropdown(false);
    } catch (error) {
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

  if (!article) {
    return null;
  }


  return (
    <div className="article-card-glass">
      <div
        className="article-image-hero-glass large-hero-img"
        onClick={e => {
          // Si le clic vient du lien profil, ne pas ouvrir la lightbox
          if (e.target.closest('.user-info-glass')) return;
          setShowLightbox(true);
        }}
        style={{ cursor: 'zoom-in' }}
      >
        <img
          src={articleData.imagePath || '/placeholder.jpg'}
          alt={articleData.title}
          onError={(e) => (e.target.src = '/placeholder.jpg')}
        />
        <div className="article-hero-overlay ">
          {articleData.authorUsername ? (
            <Link
              className="user-info-glass z-1000"
              to={`/profile/${articleData.authorUsername}`}
              style={{ textDecoration: 'none', color: 'inherit', pointerEvents: 'auto' }}
              onClick={e => {
                e.stopPropagation();
                // Pour debug :
                // console.log('Redirection vers le profil', `/profile/${articleData.authorUsername}`);
              }}
              tabIndex={0}
            >
              <img
                src={articleData.authorProfilePicture || '/default-avatar.png'}
                alt={displayName}
                className="user-avatar-glass"
                style={{ pointerEvents: 'auto' }}
                onClick={e => e.stopPropagation()}
              />
              <div className="user-details-glass" style={{ pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
                <span className="username-glass">{displayName}</span>
              </div>
            </Link>
          ) : (
            <div className="user-info-glass">
              <img
                src={articleData.authorProfilePicture || '/default-avatar.png'}
                alt={displayName}
                className="user-avatar-glass"
              />
              <div className="user-details-glass">
                <span className="username-glass">{displayName}</span>
              </div>
            </div>
          )}
          <div className="more-options-glass" ref={dropdownRef}>
            <button className="more-btn-glass" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>•••</button>
            {showDropdown && (
              <div className="dropdown-menu-glass">
                <div className="dropdown-item-glass" onClick={handleView}>
                  <FaEye /> Voir
                </div>
                <div className="dropdown-item-glass" onClick={handleEdit}>
                  <FaEdit /> Modifier
                </div>
                <div className="dropdown-item-glass delete" onClick={handleDelete}>
                  <FaTrash /> Supprimer
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="article-content-glass">
        <div className='flex flex-col'> 
           <span className="location-glass">{articleData.location}</span>
        <h3 className="article-title-glass">{articleData.title}</h3>
        <div className="article-details-glass"> </div>
          <p className="article-description-glass">{articleData.description}</p>
          <div className="article-meta-glass">
            <span className="article-price-glass">
              {articleData.price ? `${new Intl.NumberFormat('fr-FR').format(articleData.price)} Ar` : 'Prix non spécifié'}
            </span>
            <span className="article-contact-glass">{articleData.contact ? `📞 ${articleData.contact}` : 'Contact non spécifié'}</span>
            <span className="article-date-glass">{articleData.createdAt.toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        <div className="action-bar-glass">
          <div className="vote-group-glass bold-vote-group">
            <button
              className={`action-button-glass vote-btn-glass bold-vote-btn up ${vote === 1 ? 'voted-up' : ''}`}
              title="Vote positif"
              onClick={() => handleVote(1)}
            >
              <MdKeyboardArrowUp />
            </button>
            <span className="vote-count-glass bold-vote-count">{votesCount}</span>
            <button
              className={`action-button-glass vote-btn-glass bold-vote-btn down ${vote === -1 ? 'voted-down' : ''}`}
              title="Vote négatif"
              onClick={() => handleVote(-1)}
            >
              <MdKeyboardArrowDown />
            </button>
          </div>
          <button onClick={() => setShowComments(!showComments)} className="action-button-glass" title="Commentaires">
            <FaComment />
          </button>
          <button className="action-button-glass" title="Partager" onClick={async () => {
            try {
              await shareArticle(article.id);
              alert('Article partagé avec succès');
            } catch (error) {
              alert('Erreur lors du partage');
            }
          }}>
            <FaShare />
          </button>
          <button onClick={() => setIsSaved(!isSaved)} className={`action-button-glass ${isSaved ? 'saved' : ''}`} title={isSaved ? "Retirer des favoris" : "Sauvegarder"}>
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
        <div className="stats-glass">
          {/* <span className="views-count-glass"><FaEye /> {views} vues</span> */}
        </div>
        {showComments && (
          <div className="comments-section-glass">
            <div className="comments-list-glass">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-glass">
                  <div className="comment-content-glass">
                    <img
                      src={comment.authorProfilePicture || '/default-avatar.png'}
                      alt={comment.authorUsername}
                      className="comment-avatar-glass"
                    />
                    <div className="comment-details-glass">
                      <span className="comment-username-glass">{comment.authorUsername}</span>
                      <span className="comment-text-glass">{comment.content}</span>
                    </div>
                  </div>
                  {comment.userId === localStorage.getItem('userId') && (
                    <button
                      onClick={async () => {
                        try {
                          await deleteComment(article.id, comment.id);
                          setComments(comments.filter(c => c.id !== comment.id));
                        } catch (error) {
                          alert('Erreur lors de la suppression du commentaire');
                        }
                      }}
                      className="delete-comment-btn-glass"
                      title="Supprimer le commentaire"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="comment-form-glass">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="comment-input-glass"
              />
              <button type="submit" className="comment-submit-glass">Publier</button>
            </form>
          </div>
        )}
      </div>
      {showLightbox && (
        <div className="lightbox-overlay-glass" onClick={() => setShowLightbox(false)}>
          <button
            className="lightbox-close-btn-glass"
            title="Fermer"
            onClick={e => {
              e.stopPropagation();
              setShowLightbox(false);
            }}
          >
            ×
          </button>
          <div className="lightbox-img-container-glass">
            <img
              src={articleData.imagePath || '/placeholder.jpg'}
              alt={articleData.title}
              className="lightbox-img-glass"
              onClick={e => e.stopPropagation()}
              id="lightbox-img-main"
            />
            <button
              className="lightbox-zoom-btn-glass"
              title="Zoomer / Dézoomer"
              onClick={e => {
                e.stopPropagation();
                const img = document.getElementById('lightbox-img-main');
                if (img.classList.contains('zoomed')) {
                  img.classList.remove('zoomed');
                } else {
                  img.classList.add('zoomed');
                }
              }}
            >
              🔍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
