using System.ComponentModel.DataAnnotations;

namespace ShareNSpare.Api.DTOs;

public class CreateInvitationRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string OrganisationName { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "Festival";
}

public class InvitationDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OrganisationName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
