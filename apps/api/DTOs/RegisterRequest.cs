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

    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    // For invited users (festivals/pros)
    public string? InvitationToken { get; set; }

    // Organisation fields (filled during festival registration)
    [MaxLength(255)]
    public string? OrganisationName { get; set; }

    [MaxLength(255)]
    public string? Website { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    public string? Description { get; set; }

    [MaxLength(50)]
    public string? FestivalSize { get; set; }
}
