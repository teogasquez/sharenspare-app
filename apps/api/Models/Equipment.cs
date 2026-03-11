using ShareNSpare.Api.Models.Enums;

namespace ShareNSpare.Api.Models;

public class Equipment
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DailyPrice { get; set; }
    public string? PriceTiersJson { get; set; }
    public int Quantity { get; set; } = 1;
    public EquipmentCondition Condition { get; set; } = EquipmentCondition.Bon;
    public bool IsAvailable { get; set; } = true;

    // Localisation de l'equipement
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Canton { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public Guid OrganisationId { get; set; }
    public Organisation Organisation { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public ICollection<EquipmentPhoto> Photos { get; set; } = new List<EquipmentPhoto>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<EquipmentBlackout> Blackouts { get; set; } = new List<EquipmentBlackout>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
