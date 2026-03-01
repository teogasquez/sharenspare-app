using System.ComponentModel.DataAnnotations;

namespace ShareNSpare.Api.DTOs;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    // For invited users (festivals/pros)
    public string? InvitationToken { get; set; }

    // For self-registration (particuliers only)
    [MaxLength(255)]
    public string? OrganisationName { get; set; }
}
