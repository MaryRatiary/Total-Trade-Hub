using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TTH.Backend.Data;
using TTH.Backend.Models;

namespace TTH.Backend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<UserService> _logger;
        private readonly MongoDbSettings _settings;

        public UserService(IMongoClient mongoClient, IConfiguration config, ILogger<UserService> logger)
        {
            _settings = config.GetSection("MongoDb").Get<MongoDbSettings>() ?? 
                throw new ArgumentNullException(nameof(config), "MongoDB settings not found in configuration");
            
            try
            {
                var database = mongoClient.GetDatabase(_settings.DatabaseName);
                _users = database.GetCollection<User>(_settings.UsersCollectionName);
                _logger = logger;
            }
            catch (Exception ex)
            {
                _logger?.LogError($"Error initializing UserService: {ex}");
                throw;
            }
        }

        public async Task<List<User>> GetAllUsersAsync() =>
            await _users.Find(_ => true).ToListAsync();

        public Task<List<User>> GetAllAsync() => GetAllUsersAsync();

        public async Task<User?> GetByIdAsync(string? id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            return await GetUserByIdAsync(id);
        }

        public async Task<User?> GetUserByIdAsync(string? id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                var filter = Builders<User>.Filter.Eq(u => u.Email, email);
                return await _users.Find(filter).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user by email: {ex}");
                return null;
            }
        }

        public async Task<User> CreateAsync(User user)
        {
            // Validation avant création
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                throw new ArgumentException("L'email ne peut pas être vide.");
            }

            user.Email = user.Email.Trim();

            // Vérifier si l'email existe déjà
            var existingEmail = await _users.Find(u => u.Email == user.Email).FirstOrDefaultAsync();
            if (existingEmail != null)
            {
                throw new InvalidOperationException("Cet email existe déjà.");
            }

            try 
            {
                await _users.InsertOneAsync(user);
                return user;
            }
            catch (MongoWriteException ex)
            {
                _logger.LogError($"Error creating user: {ex.Message}");
                if (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
                {
                    if (ex.Message.Contains("email"))
                    {
                        throw new InvalidOperationException("Cet email existe déjà.");
                    }
                }
                throw;
            }
        }

        public async Task UpdateAsync(string id, User userIn)
        {
            try
            {
                var result = await _users.ReplaceOneAsync(user => user.Id == id, userIn);
                if (result.ModifiedCount == 0)
                {
                    throw new Exception("Utilisateur non trouvé");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user: {ex}");
                throw new Exception("Une erreur est survenue lors de la mise à jour de l'utilisateur", ex);
            }
        }

        public async Task DeleteUserAsync(string id) =>
            await _users.DeleteOneAsync(x => x.Id == id);

        public async Task InitializeIndexesAsync()
        {
            try
            {
                // Supprimer tous les index existants sauf _id
                var indexCursor = await _users.Indexes.ListAsync();
                var indexes = await indexCursor.ToListAsync();
                foreach (var index in indexes)
                {
                    var indexName = index["name"].AsString;
                    if (indexName != "_id_") // Ne pas supprimer l'index _id
                    {
                        await _users.Indexes.DropOneAsync(indexName);
                    }
                }
                
                // Créer uniquement l'index sur l'email
                var emailIndexKeysDefinition = Builders<User>.IndexKeys.Ascending(user => user.Email);
                var emailIndexOptions = new CreateIndexOptions { Unique = true };
                var emailIndexModel = new CreateIndexModel<User>(emailIndexKeysDefinition, emailIndexOptions);
                
                await _users.Indexes.CreateOneAsync(emailIndexModel);
                _logger.LogInformation("MongoDB indexes initialized successfully");
            }
            catch (MongoAuthenticationException ex)
            {
                _logger.LogWarning("MongoDB authentication not required: {Message}", ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error initializing MongoDB indexes: {ex}");
                throw;
            }
        }

        public async Task<User> UpdateCoverPicture(string userId, string coverPictureUrl)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.Set(u => u.CoverPicture, coverPictureUrl);
            
            var updateResult = await _users.UpdateOneAsync(filter, update);
            if (updateResult.ModifiedCount == 0)
            {
                throw new InvalidOperationException("User not found");
            }

            var updatedUser = await GetUserByIdAsync(userId);
            if (updatedUser == null)
            {
                throw new InvalidOperationException("User not found after update");
            }

            return updatedUser;
        }
    }
}
