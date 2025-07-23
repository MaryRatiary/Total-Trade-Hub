using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TTH.Backend.Models;
using TTH.Backend.Services;
using TTH.Backend.Models.DTOs;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly MessageService _messageService;
        private readonly UserService _userService;
        private readonly ILogger<MessageController> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly string _baseUrl;

        public MessageController(
            MessageService messageService,
            UserService userService,
            ILogger<MessageController> logger,
            IWebHostEnvironment environment)
        {
            _messageService = messageService;
            _userService = userService;
            _logger = logger;
            _environment = environment;
            _baseUrl = environment.IsDevelopment() 
                ? "http://192.168.88.160:5131"  // URL de développement
                : "http://192.168.88.160:5131"; // URL de production
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

        [HttpGet("conversations")]
        public async Task<IActionResult> GetUserConversations()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var messages = await _messageService.GetMessagesForUserAsync(userId);
                var conversations = messages
                    .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                    .Select(async g =>
                    {
                        var otherUserId = g.Key;
                        var otherUser = await _userService.GetUserByIdAsync(otherUserId);
                        var lastMessage = g.OrderByDescending(m => m.CreatedAt).First();

                        return new
                        {
                            id = otherUserId,
                            firstName = otherUser?.FirstName,
                            lastName = otherUser?.LastName,
                            profilePicture = GetFullUrl(otherUser?.ProfilePicture),
                            lastMessage = lastMessage.Content,
                            lastMessageTime = lastMessage.CreatedAt,
                            unreadCount = g.Count(m => !m.IsRead && m.SenderId == otherUserId)
                        };
                    })
                    .Select(t => t.Result)
                    .ToList();

                return Ok(conversations);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting conversations: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving conversations" });
            }
        }

        [HttpGet("messages/{otherUserId}")]
        public async Task<IActionResult> GetConversationMessages(string otherUserId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var messages = await _messageService.GetMessagesForUserAsync(userId);
                var conversationMessages = messages
                    .Where(m => 
                        (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                        (m.SenderId == otherUserId && m.ReceiverId == userId))
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new {
                        id = m.Id,
                        senderId = m.SenderId,
                        receiverId = m.ReceiverId,
                        content = m.Content,
                        createdAt = m.CreatedAt.ToUniversalTime(),
                        isRead = m.IsRead
                    })
                    .ToList();

                // Marquer les messages comme lus
                foreach (var message in messages.Where(m => !m.IsRead && m.ReceiverId == userId))
                {
                    message.IsRead = true;
                    await _messageService.UpdateMessageAsync(message);
                }

                return Ok(conversationMessages);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting conversation messages: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving messages" });
            }
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto messageDto)
        {
            try
            {
                var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(senderId))
                {
                    return Unauthorized();
                }

                var message = new Message
                {
                    SenderId = senderId,
                    ReceiverId = messageDto.ReceiverId,
                    Content = messageDto.Content,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _messageService.CreateMessageAsync(message);
                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending message: {ex.Message}");
                return StatusCode(500, new { message = "Error sending message" });
            }
        }
    }
}