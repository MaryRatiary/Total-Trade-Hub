using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TTH.Backend.Services;
using TTH.Backend.Models;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly ArticleService _articleService;
        private readonly UserService _userService;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ArticlesController> _logger;
        private readonly string _baseUrl;

        public ArticlesController(
            ArticleService articleService,
            UserService userService,
            IWebHostEnvironment environment,
            ILogger<ArticlesController> logger)
        {
            _articleService = articleService;
            _userService = userService;
            _environment = environment;
            _logger = logger;
            _baseUrl = environment.IsDevelopment() 
                ? "http://192.168.88.160:5131"  // URL de développement
                : "http://192.168.88.160:5131"; // URL de production (à modifier selon vos besoins)
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllArticles()
        {
            try
            {
                _logger.LogInformation("Starting GetAllArticles request");
                var articles = await _articleService.GetAllAsync();
                _logger.LogInformation($"Retrieved {articles.Count} articles from service");

                var response = articles.Select(a => {
                    _logger.LogInformation($"Processing article ID: {a.Id}");
                    _logger.LogInformation($"Article data: Title={a.Title}, Author={a.AuthorFirstName} {a.AuthorLastName}");
                    
                    // Ensure user data is included
                    if (string.IsNullOrEmpty(a.AuthorFirstName) || string.IsNullOrEmpty(a.AuthorLastName))
                    {
                        var user = _userService.GetByIdAsync(a.UserId).Result;
                        if (user != null)
                        {
                            a.AuthorFirstName = user.FirstName;
                            a.AuthorLastName = user.LastName;
                            a.AuthorUsername = user.Username;
                            a.AuthorProfilePicture = user.ProfilePicture;
                        }
                    }
                    
                    return new
                    {
                        id = a.Id,
                        title = a.Title,
                        content = a.Content,
                        price = a.Price,
                        location = a.Location,
                        description = a.Description,
                        contact = a.Contact,
                        imagePath = GetFullUrl(a.ImagePath),
                        authorFirstName = a.AuthorFirstName,
                        authorLastName = a.AuthorLastName,
                        authorUsername = a.AuthorUsername,
                        authorProfilePicture = GetFullUrl(a.AuthorProfilePicture),
                        createdAt = a.CreatedAt
                    };
                }).ToList();

                _logger.LogInformation($"Processed response with {response.Count} articles");
                foreach (var item in response)
                {
                    _logger.LogInformation($"Response item: ID={item.id}, Title={item.title}, Author={item.authorFirstName} {item.authorLastName}");
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetAllArticles: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error fetching articles", error = ex.Message });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserArticles()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "User ID is required" });
                }

                var articles = await _articleService.GetArticlesByUserIdAsync(userId);
                if (articles == null || !articles.Any())
                {
                    return Ok(new List<object>()); // Return empty array instead of 404
                }

                var response = articles.Select(a => new
                {
                    id = a.Id,
                    title = a.Title,
                    content = a.Content,
                    price = a.Price,
                    location = a.Location,
                    description = a.Description,
                    contact = a.Contact,
                    imagePath = GetFullUrl(a.ImagePath),
                    createdAt = a.CreatedAt,
                    userId = a.UserId,
                    authorFirstName = a.AuthorFirstName,
                    authorLastName = a.AuthorLastName,
                    authorUsername = a.AuthorUsername,
                    authorProfilePicture = GetFullUrl(a.AuthorProfilePicture)
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetUserArticles: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Article>>> GetArticlesByUserId(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "User ID is required" });
                }

                var articles = await _articleService.GetArticlesByUserIdAsync(userId);
                if (articles == null || !articles.Any())
                {
                    return NotFound(new { message = "No articles found for this user" });
                }

                // Enhance articles with user info
                var user = await _userService.GetByIdAsync(userId);
                if (user != null)
                {
                    foreach (var article in articles)
                    {
                        article.AuthorUsername = user.Username;
                        article.AuthorFirstName = user.FirstName;
                        article.AuthorLastName = user.LastName;
                        article.AuthorProfilePicture = user.ProfilePicture;
                    }
                }

                return Ok(articles);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting articles by user ID: {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching articles" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateArticle([FromForm] ArticleDto articleDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "User ID is required" });
                }

                var user = await _userService.GetUserByIdAsync(userId);
                
                if (user == null)
                    return Unauthorized(new { message = "User not found" });

                var article = new Article
                {
                    Title = articleDto.Title,
                    Content = articleDto.Content,
                    Price = articleDto.Price,
                    Location = articleDto.Location,
                    Description = articleDto.Description,
                    Contact = articleDto.Contact,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    AuthorFirstName = user.FirstName,
                    AuthorLastName = user.LastName,
                    AuthorUsername = user.Username,
                    AuthorProfilePicture = user.ProfilePicture
                };

                if (articleDto.Image != null)
                {
                    article.ImagePath = await SaveImageFile(articleDto.Image);
                }

                await _articleService.CreateAsync(article);
                
                // Return the full article with all necessary information
                var response = new
                {
                    message = "Article created successfully",
                    article = new
                    {
                        id = article.Id,
                        title = article.Title,
                        content = article.Content,
                        price = article.Price,
                        location = article.Location,
                        description = article.Description,
                        contact = article.Contact,
                        imagePath = GetFullUrl(article.ImagePath),
                        createdAt = article.CreatedAt,
                        userId = article.UserId,
                        authorFirstName = article.AuthorFirstName,
                        authorLastName = article.AuthorLastName,
                        authorUsername = article.AuthorUsername,
                        authorProfilePicture = !string.IsNullOrEmpty(article.AuthorProfilePicture)
                            ? $"http://192.168.88.160:5131{article.AuthorProfilePicture}"
                            : null
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating article: {ex.Message}");
                return StatusCode(500, new { message = "Error creating article" });
            }
        }

        private string GetFullUrl(string? path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return string.Empty;
            }

            // Si le chemin est déjà une URL complète, on la retourne telle quelle
            if (path.StartsWith("http://") || path.StartsWith("https://"))
            {
                return path;
            }

            // S'assurer que le chemin commence par /
            if (!path.StartsWith("/"))
            {
                path = "/" + path;
            }

            return $"{_baseUrl}{path}";
        }

        private async Task<string> SaveImageFile(IFormFile? image)
        {
            if (image == null) return string.Empty;

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return $"/uploads/{uniqueFileName}";
        }

        [HttpDelete("deleteAll")]
        [Authorize]
        public async Task<IActionResult> DeleteAllArticles()
        {
            try
            {
                _logger.LogInformation("Starting DeleteAllArticles request");
                await _articleService.DeleteAllAsync();
                _logger.LogInformation("Successfully deleted all articles");
                return Ok(new { message = "All articles deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting all articles: {ex.Message}");
                return StatusCode(500, new { message = "Error deleting articles" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteArticle(string id)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete article with ID: {id}");
                
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "User ID is required" });
                }

                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    _logger.LogWarning($"Article {id} not found");
                    return NotFound(new { message = "Article not found" });
                }

                if (article.UserId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to delete article {id} without permission");
                    return Forbid();
                }

                await _articleService.DeleteAsync(id);
                _logger.LogInformation($"Article {id} deleted successfully");
                
                return Ok(new { message = "Article deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting article: {ex.Message}");
                return StatusCode(500, new { message = "Error deleting article" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticleById(string id)
        {
            try
            {
                _logger.LogInformation($"Fetching article with ID: {id}");
                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    _logger.LogWarning($"Article with ID {id} not found");
                    return NotFound(new { message = "Article not found" });
                }

                var response = new
                {
                    id = article.Id,
                    title = article.Title,
                    content = article.Content,
                    price = article.Price,
                    location = article.Location,
                    description = article.Description,
                    contact = article.Contact,
                    imagePath = GetFullUrl(article.ImagePath),
                    createdAt = article.CreatedAt,
                    authorFirstName = article.AuthorFirstName,
                    authorLastName = article.AuthorLastName,
                    authorUsername = article.AuthorUsername,
                    authorProfilePicture = GetFullUrl(article.AuthorProfilePicture)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching article by ID: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching article" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateArticle(string id, [FromForm] ArticleDto articleDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "User ID is required" });
                }

                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    _logger.LogWarning($"Article with ID {id} not found");
                    return NotFound(new { message = "Article not found" });
                }

                if (article.UserId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to update article {id} without permission");
                    return Forbid();
                }

                article.Title = articleDto.Title;
                article.Content = articleDto.Content;
                article.Price = articleDto.Price;
                article.Location = articleDto.Location;
                article.Description = articleDto.Description;
                article.Contact = articleDto.Contact;

                if (articleDto.Image != null)
                {
                    article.ImagePath = await SaveImageFile(articleDto.Image);
                }

                await _articleService.UpdateAsync(id, article);
                return Ok(new { message = "Article updated successfully", article });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating article: {ex.Message}");
                return StatusCode(500, new { message = "Error updating article" });
            }
        }

        [HttpGet("friends")]
        [Authorize]
        public async Task<IActionResult> GetFriendsArticles()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var articles = await _articleService.GetFriendsArticlesAsync(userId);
                var response = articles.Select(a => new
                {
                    id = a.Id,
                    title = a.Title,
                    content = a.Content,
                    price = a.Price,
                    location = a.Location,
                    description = a.Description,
                    contact = a.Contact,
                    imagePath = GetFullUrl(a.ImagePath),
                    authorFirstName = a.AuthorFirstName,
                    authorLastName = a.AuthorLastName,
                    authorUsername = a.AuthorUsername,
                    authorProfilePicture = GetFullUrl(a.AuthorProfilePicture),
                    createdAt = a.CreatedAt,
                    likes = a.Likes,
                    comments = a.Comments,
                    shareCount = a.ShareCount
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching friends' articles: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching friends' articles", error = ex.Message });
            }
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikeArticle(string id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _articleService.LikeArticleAsync(id, userId);
                if (!result)
                    return NotFound();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in LikeArticle: {ex}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(string id, [FromBody] CommentDto commentDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var comment = await _articleService.AddCommentAsync(id, userId, commentDto.Content);
                if (comment == null)
                    return NotFound();

                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in AddComment: {ex}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpDelete("{articleId}/comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(string articleId, string commentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _articleService.DeleteCommentAsync(articleId, commentId, userId);
                if (!result)
                    return NotFound();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in DeleteComment: {ex}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("{id}/share")]
        public async Task<IActionResult> ShareArticle(string id)
        {
            try
            {
                var result = await _articleService.ShareArticleAsync(id);
                if (!result)
                    return NotFound();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in ShareArticle: {ex}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPost("{id}/views")]
        public async Task<IActionResult> IncrementViews(string id)
        {
            try
            {
                _logger.LogInformation($"Incrementing views for article {id}");
                var success = await _articleService.IncrementViewsAsync(id);
                if (!success)
                {
                    return NotFound("Article not found");
                }
                return Ok(new { message = "Views incremented successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error incrementing views: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/views")]
        public async Task<IActionResult> GetViews(string id)
        {
            try
            {
                _logger.LogInformation($"Getting views for article {id}");
                var views = await _articleService.GetViewsAsync(id);
                return Ok(new { views });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting views: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Article>>> Get()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var articles = await _articleService.GetAllAsync(userId);
                return Ok(articles);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in Get: {ex}");
                return StatusCode(500, "An error occurred while retrieving the articles.");
            }
        }
    }

    public class CommentDto
    {
        public string Content { get; set; } = string.Empty;
    }
}

