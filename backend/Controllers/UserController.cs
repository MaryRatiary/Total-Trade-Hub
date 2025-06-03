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

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
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
        public async Task<IActionResult> UploadCoverPicture(IFormFile image)
        {
            try
            {
                var userId = User.FindFirst("id")?.Value;
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

                var coverPictureUrl = $"/covers/{uniqueFileName}";
                await _userService.UpdateCoverPicture(userId, coverPictureUrl);

                return Ok(new { coverPictureUrl });
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
