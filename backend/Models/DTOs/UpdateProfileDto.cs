using System;

namespace TTH.Backend.Models.DTOs
{
    public class UpdateProfileDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Residence { get; set; }
        public DateTime? Birthdate { get; set; }
    }
}
