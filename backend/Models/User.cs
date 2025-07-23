using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TTH.Backend.Models // Ensure this namespace matches the one imported in Article.cs
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = string.Empty;
        
        [BsonElement("firstName")]
        public string FirstName { get; set; } = string.Empty;
        
        [BsonElement("lastName")]
        public string LastName { get; set; } = string.Empty;
        
        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;
        
        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;
        
        [BsonElement("profilePicture")]
        public string ProfilePicture { get; set; } = string.Empty;

        [BsonElement("coverPicture")]
        public string CoverPicture { get; set; } = string.Empty;

        [BsonIgnore]
        public string FullProfilePictureUrl => !string.IsNullOrEmpty(ProfilePicture) ? 
            (ProfilePicture.StartsWith("http") ? ProfilePicture : $"http://192.168.88.160:5131{ProfilePicture}") : 
            "http://192.168.88.160:5131/default-avatar.png";
        
        [BsonIgnore]
        public string FullCoverPictureUrl => !string.IsNullOrEmpty(CoverPicture) ? 
            (CoverPicture.StartsWith("http") ? CoverPicture : $"http://192.168.88.160:5131{CoverPicture}") : 
            "http://192.168.88.160:5131/defaults/default-cover.jpg";
        
        [BsonElement("phone")]
        public string? Phone { get; set; }
        
        [BsonElement("residence")]
        public string? Residence { get; set; }
        
        [BsonElement("birthdate")]
        public DateTime Birthdate { get; set; }
        
        [BsonElement("isRegistrationComplete")]
        public bool IsRegistrationComplete { get; set; }
        
        [BsonIgnore]
        public string? Password { get; set; } // Temporaire pour l'authentification
        
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("faceData")]
        public FaceData? FaceData { get; set; }

        [BsonIgnore]
        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

        [BsonElement("faceImage")]
        public string? FaceImage { get; set; } // Anciennement dans FaceData

        [BsonElement("friends")]
        public List<string> Friends { get; set; } = new List<string>();

        [BsonElement("bio")]
        public string? Bio { get; set; }

        // Notification Settings
        [BsonElement("pushNotificationsEnabled")]
        public bool PushNotificationsEnabled { get; set; } = true;
        
        [BsonElement("emailNotificationsEnabled")]
        public bool EmailNotificationsEnabled { get; set; } = true;
        
        [BsonElement("notificationSoundsEnabled")]
        public bool NotificationSoundsEnabled { get; set; } = true;

        // Appearance Settings
        [BsonElement("darkModeEnabled")]
        public bool DarkModeEnabled { get; set; } = false;
        
        [BsonElement("theme")]
        public string Theme { get; set; } = "Default";
        
        [BsonElement("fontSize")]
        public string FontSize { get; set; } = "Medium";

        // Security Settings
        [BsonElement("twoFactorEnabled")]
        public bool TwoFactorEnabled { get; set; } = false;
        
        [BsonElement("lastPasswordChange")]
        public DateTime? LastPasswordChange { get; set; }

        // Messaging System
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

        // Friend Request System
        [BsonElement("sentFriendRequests")]
        public virtual ICollection<FriendRequest> SentFriendRequests { get; set; } = new List<FriendRequest>();
        
        [BsonElement("receivedFriendRequests")]
        public virtual ICollection<FriendRequest> ReceivedFriendRequests { get; set; } = new List<FriendRequest>();

        public bool ValidatePassword(string inputPassword)
        {
            // Compares the input password with the stored hashed password
            return BCrypt.Net.BCrypt.Verify(inputPassword, PasswordHash);
        }

        public void HashPassword()
        {
            if (!string.IsNullOrEmpty(Password))
            {
                // Hashes the plaintext password and clears it for security
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password);
                Password = null; // Clear plaintext password after hashing
            }
        }
    }
}
