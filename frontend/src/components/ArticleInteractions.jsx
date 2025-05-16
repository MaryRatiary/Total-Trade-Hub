import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaTrash } from 'react-icons/fa';
import { likeArticle, addComment, deleteComment, shareArticle } from '../services/articleService';
import { toast } from 'react-toastify';

const ArticleInteractions = ({ article, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      await likeArticle(article.id);
      onUpdate();
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(article.id, newComment.trim());
      setNewComment('');
      onUpdate();
      toast.success('Commentaire ajouté');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(article.id, commentId);
      onUpdate();
      toast.success('Commentaire supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression du commentaire');
    }
  };

  const handleShare = async () => {
    try {
      await shareArticle(article.id);
      onUpdate();
      toast.success('Article partagé');
    } catch (error) {
      toast.error('Erreur lors du partage');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-6">
        <button
          onClick={handleLike}
          className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
        >
          {article.hasLiked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart />
          )}
          <span>{article.likes?.length || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
        >
          <FaComment />
          <span>{article.comments?.length || 0}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1 text-gray-600 hover:text-green-500"
        >
          <FaShare />
          <span>{article.shareCount || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Commenter
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {article.comments?.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                <img
                  src={comment.authorProfilePicture || '/default-avatar.png'}
                  alt={comment.authorUsername}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{comment.authorUsername}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                {comment.userId === localStorage.getItem('userId') && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleInteractions;
