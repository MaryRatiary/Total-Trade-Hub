using Microsoft.AspNetCore.Mvc;
using TTH.Backend.Models;
using TTH.Backend.Models.DTOs;
using TTH.Backend.Services;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System;
using System.IO;
using System.Security.Claims;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(UserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        private string GetFullUrl(string relativePath)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            return $"{baseUrl}{relativePath}";
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto profileDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Utilisateur non authentifié" });
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }

                // Mise à jour des informations
                user.FirstName = profileDto.FirstName.Trim();
                user.LastName = profileDto.LastName.Trim();
                user.Phone = profileDto.Phone?.Trim();
                user.Residence = profileDto.Residence?.Trim();
                user.Birthdate = profileDto.Birthdate ?? user.Birthdate;

                await _userService.UpdateAsync(userId, user);

                return Ok(new
                {
                    message = "Profil mis à jour avec succès",
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        phone = user.Phone,
                        birthdate = user.Birthdate,
                        residence = user.Residence,
                        profilePicture = user.ProfilePicture
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur lors de la mise à jour du profil : {ex.Message}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour du profil" });
            }
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto messageDto)
        {
            var sender = await _userService.GetUserByIdAsync(messageDto.SenderId);
            var receiver = await _userService.GetUserByIdAsync(messageDto.ReceiverId);

            if (sender == null || receiver == null)
                return NotFound("Sender or receiver not found.");

            // TODO: Implement message collection in MongoDB
            return Ok("Message sent successfully.");
        }

        [HttpPost("send-friend-request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto friendRequestDto)
        {
            var sender = await _userService.GetUserByIdAsync(friendRequestDto.SenderId);
            var receiver = await _userService.GetUserByIdAsync(friendRequestDto.ReceiverId);

            if (sender == null || receiver == null)
                return NotFound("Sender or receiver not found.");

            // TODO: Implement friend request collection in MongoDB
            return Ok("Friend request sent successfully.");
        }

        [HttpPost("cover-picture")]
        [Authorize]
        public async Task<IActionResult> UploadCoverPicture([FromForm] IFormFile image)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                if (image == null || image.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "covers");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                }

                var relativePath = $"/covers/{uniqueFileName}";
                await _userService.UpdateCoverPicture(userId, relativePath);
                
                var fullUrl = GetFullUrl(relativePath);
                _logger.LogInformation($"Cover picture URL: {fullUrl}");
                
                return Ok(new { 
                    coverPictureUrl = fullUrl,
                    message = "Cover picture updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{userId}/cover-picture")]
        public async Task<IActionResult> UpdateCoverPicture(string userId, [FromBody] UpdateCoverPictureRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.PhotoUrl))
                {
                    return BadRequest("Photo URL is required");
                }

                await _userService.UpdateCoverPicture(userId, request.PhotoUrl);
                return Ok(new { coverPictureUrl = request.PhotoUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class UpdateCoverPictureRequest
        {
            public required string PhotoUrl { get; set; }
        }
    }
}
