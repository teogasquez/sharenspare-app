using ShareNSpare.Api.Models.Enums;

namespace ShareNSpare.Api.Models;

public class Invitation
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OrganisationName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Festival;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
