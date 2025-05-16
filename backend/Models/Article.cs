using System.ComponentModel.DataAnnotations;
using TTH.Backend.Models; // Ensure this namespace matches the namespace in User.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TTH.Backend.Models
{
    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("content")]
        public string Content { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonIgnore]
        public string AuthorUsername { get; set; } = string.Empty;

        [BsonIgnore]
        public string? AuthorProfilePicture { get; set; }
    }

    public class Article
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonRequired]
        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("content")]
        public string Content { get; set; } = string.Empty;

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("location")]
        public string Location { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("contact")]
        public string Contact { get; set; } = string.Empty;

        [BsonElement("imagePath")]
        public string ImagePath { get; set; } = string.Empty;

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("likes")]
        public List<string> Likes { get; set; } = new List<string>();

        [BsonElement("comments")]
        public List<Comment> Comments { get; set; } = new List<Comment>();

        [BsonElement("shareCount")]
        public int ShareCount { get; set; } = 0;

        [BsonIgnore]
        public string AuthorFirstName { get; set; } = string.Empty;
        [BsonIgnore]
        public string AuthorLastName { get; set; } = string.Empty;
        [BsonIgnore]
        public string AuthorUsername { get; set; } = string.Empty;
        [BsonIgnore]
        public string? AuthorProfilePicture { get; set; }
        [BsonIgnore]
        public bool HasLiked { get; set; }

        [BsonIgnore]
        public string FullImageUrl => ImagePath;
    }
}