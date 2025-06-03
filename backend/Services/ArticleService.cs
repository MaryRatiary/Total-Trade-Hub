using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using MongoDB.Bson;
using TTH.Backend.Data;
using TTH.Backend.Models;

namespace TTH.Backend.Services
{
    public class ArticleService
    {
        private readonly IMongoCollection<Article> _articles;
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<ArticleService> _logger;

        public ArticleService(
            IOptions<MongoDbSettings> settings,
            IMongoClient mongoClient,
            ILogger<ArticleService> logger)
        {
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _articles = database.GetCollection<Article>(settings.Value.ArticlesCollectionName);
            _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _logger = logger;
        }

        public async Task<List<Article>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Starting GetAllAsync in ArticleService");
                
                var articles = await _articles.Find(_ => true)
                    .SortByDescending(a => a.CreatedAt)
                    .ToListAsync();
                
                _logger.LogInformation($"Found {articles.Count} articles in database");

                foreach (var article in articles)
                {
                    _logger.LogInformation($"Processing article {article.Id}");
                    var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
                    
                    if (user != null)
                    {
                        _logger.LogInformation($"Found author: {user.FirstName} {user.LastName}");
                        article.AuthorFirstName = user.FirstName;
                        article.AuthorLastName = user.LastName;
                        article.AuthorUsername = user.Username;
                        article.AuthorProfilePicture = user.ProfilePicture;
                    }
                    else
                    {
                        _logger.LogWarning($"No author found for article {article.Id}");
                    }
                }

                _logger.LogInformation("Finished processing all articles");
                return articles;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetAllAsync: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<List<Article>> GetAllAsync(string? currentUserId = null)
        {
            try
            {
                _logger.LogInformation("Starting GetAllAsync in ArticleService");
                
                var articles = await _articles.Find(_ => true)
                    .SortByDescending(a => a.CreatedAt)
                    .ToListAsync();
                
                _logger.LogInformation($"Found {articles.Count} articles in database");

                foreach (var article in articles)
                {
                    _logger.LogInformation($"Processing article {article.Id}");
                    var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
                    
                    if (user != null)
                    {
                        _logger.LogInformation($"Found author: {user.FirstName} {user.LastName}");
                        article.AuthorFirstName = user.FirstName;
                        article.AuthorLastName = user.LastName;
                        article.AuthorUsername = user.Username;
                        article.AuthorProfilePicture = user.ProfilePicture;
                    }
                    else
                    {
                        _logger.LogWarning($"No author found for article {article.Id}");
                    }

                    if (currentUserId != null)
                    {
                        article.HasLiked = article.Likes.Contains(currentUserId);
                    }
                }

                _logger.LogInformation("Finished processing all articles");
                return articles;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetAllAsync: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<Article?> GetByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                return null;
                
            try 
            {
                var article = await _articles.Find(x => x.Id == id).FirstOrDefaultAsync();
                if (article != null)
                {
                    var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
                    if (user != null)
                    {
                        article.AuthorFirstName = user.FirstName;
                        article.AuthorLastName = user.LastName;
                        article.AuthorUsername = user.Username;
                        article.AuthorProfilePicture = user.ProfilePicture;
                    }
                }
                return article;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting article by ID: {ex}");
                return null;
            }
        }

        public async Task CreateAsync(Article article)
        {
            var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
            if (user != null)
            {
                article.AuthorFirstName = user.FirstName;
                article.AuthorLastName = user.LastName;
                article.AuthorUsername = user.Username;
                article.AuthorProfilePicture = user.ProfilePicture;
            }
            await _articles.InsertOneAsync(article);
        }

        public async Task UpdateAsync(string id, Article article)
        {
            try
            {
                _logger.LogInformation($"Updating article with ID: {id}");
                
                // Récupérer les informations de l'utilisateur
                var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
                if (user != null)
                {
                    article.AuthorFirstName = user.FirstName;
                    article.AuthorLastName = user.LastName;
                    article.AuthorUsername = user.Username;
                    article.AuthorProfilePicture = user.ProfilePicture;
                }
                
                await _articles.ReplaceOneAsync(a => a.Id == id, article);
                _logger.LogInformation($"Article with ID {id} updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating article {id}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete article with ID: {id}");
                var result = await _articles.DeleteOneAsync(a => a.Id == id);
                _logger.LogInformation($"Delete result: {result.DeletedCount} document(s) deleted");
                
                if (result.DeletedCount == 0)
                {
                    _logger.LogWarning($"No article found with ID: {id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting article {id}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAllAsync() =>
            await _articles.DeleteManyAsync(Builders<Article>.Filter.Empty);

        public async Task<List<Article>> GetArticlesByUserIdAsync(string userId)
        {
            var articles = await _articles.Find(a => a.UserId == userId)
                                        .SortByDescending(a => a.CreatedAt)
                                        .ToListAsync();

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user != null)
            {
                foreach (var article in articles)
                {
                    article.AuthorFirstName = user.FirstName;
                    article.AuthorLastName = user.LastName;
                    article.AuthorUsername = user.Username;
                    article.AuthorProfilePicture = user.ProfilePicture;
                }
            }
            return articles;
        }

        public async Task<bool> LikeArticleAsync(string articleId, string userId)
        {
            try
            {
                var article = await _articles.Find(x => x.Id == articleId).FirstOrDefaultAsync();
                if (article == null)
                    return false;

                var update = article.Likes.Contains(userId)
                    ? Builders<Article>.Update.Pull("likes", userId)
                    : Builders<Article>.Update.Push("likes", userId);

                var result = await _articles.UpdateOneAsync(x => x.Id == articleId, update);
                return result.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error liking article: {ex}");
                return false;
            }
        }

        public async Task<Comment?> AddCommentAsync(string articleId, string userId, string content)
        {
            try
            {
                var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
                if (user == null)
                    return null;

                var comment = new Comment
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    UserId = userId,
                    Content = content,
                    CreatedAt = DateTime.UtcNow,
                    AuthorUsername = user.Username,
                    AuthorProfilePicture = user.ProfilePicture
                };

                var update = Builders<Article>.Update.Push("comments", comment);
                await _articles.UpdateOneAsync(x => x.Id == articleId, update);

                return comment;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding comment: {ex}");
                return null;
            }
        }

        public async Task<bool> DeleteCommentAsync(string articleId, string commentId, string userId)
        {
            try
            {
                var update = Builders<Article>.Update.PullFilter(
                    x => x.Comments,
                    c => c.Id == commentId && c.UserId == userId
                );

                var result = await _articles.UpdateOneAsync(x => x.Id == articleId, update);
                return result.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting comment: {ex}");
                return false;
            }
        }

        public async Task<bool> ShareArticleAsync(string articleId)
        {
            try
            {
                var update = Builders<Article>.Update.Inc(x => x.ShareCount, 1);
                var result = await _articles.UpdateOneAsync(x => x.Id == articleId, update);
                return result.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sharing article: {ex}");
                return false;
            }
        }

        public async Task<List<Article>> GetFriendsArticlesAsync(string userId)
        {
            try
            {
                var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
                if (user == null || user.Friends == null)
                {
                    return new List<Article>();
                }

                var articles = await _articles
                    .Find(a => user.Friends.Contains(a.UserId))
                    .SortByDescending(a => a.CreatedAt)
                    .ToListAsync();

                foreach (var article in articles)
                {
                    var author = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
                    if (author != null)
                    {
                        article.AuthorFirstName = author.FirstName;
                        article.AuthorLastName = author.LastName;
                        article.AuthorUsername = author.Username;
                        article.AuthorProfilePicture = author.ProfilePicture;
                    }
                }

                return articles;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetFriendsArticlesAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> IncrementViewsAsync(string articleId)
        {
            try
            {
                _logger.LogInformation($"Incrementing views for article {articleId}");
                var filter = Builders<Article>.Filter.Eq(a => a.Id, articleId);
                var update = Builders<Article>.Update.Inc(a => a.Views, 1);
                var result = await _articles.UpdateOneAsync(filter, update);
                return result.ModifiedCount > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error incrementing views for article {articleId}: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        public async Task<int> GetViewsAsync(string articleId)
        {
            try
            {
                _logger.LogInformation($"Getting views for article {articleId}");
                var article = await _articles.Find(a => a.Id == articleId).FirstOrDefaultAsync();
                return article?.Views ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting views for article {articleId}: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return 0;
            }
        }
    }
}
