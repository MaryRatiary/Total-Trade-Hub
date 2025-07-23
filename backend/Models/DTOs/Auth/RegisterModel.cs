using System;
using System.ComponentModel.DataAnnotations;

namespace TTH.Backend.Models.DTOs.Auth
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "L'email est requis")]
        [EmailAddress(ErrorMessage = "Format d'email invalide")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le mot de passe est requis")]
        [MinLength(6, ErrorMessage = "Le mot de passe doit contenir au moins 6 caractères")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le prénom est requis")]
        [MinLength(2, ErrorMessage = "Le prénom doit contenir au moins 2 caractères")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le nom est requis")]
        [MinLength(2, ErrorMessage = "Le nom doit contenir au moins 2 caractères")]
        public string LastName { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? Residence { get; set; }
        public DateTime? Birthdate { get; set; }
    }
}
