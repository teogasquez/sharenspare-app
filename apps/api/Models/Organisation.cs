using ShareNSpare.Api.Models.Enums;

namespace ShareNSpare.Api.Models;

public class Organisation
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public OrganisationType Type { get; set; } = OrganisationType.Particulier;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Canton { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation: 1 Organisation = N Users
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Equipment> Equipments { get; set; } = new List<Equipment>();
}