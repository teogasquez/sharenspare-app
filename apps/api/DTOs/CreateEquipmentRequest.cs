using System.ComponentModel.DataAnnotations;

namespace ShareNSpare.Api.DTOs;

public class CreateEquipmentRequest
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    [Range(0, 999999.99)]
    public decimal DailyPrice { get; set; }

    [Range(1, 10000)]
    public int Quantity { get; set; } = 1;

    [Required]
    public string Condition { get; set; } = "Bon";

    [Required]
    public Guid CategoryId { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(2)]
    public string? Canton { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public bool IsAvailable { get; set; } = true;

    public string? PriceTiersJson { get; set; }
}

public class UpdateEquipmentRequest
{
    [MaxLength(255)]
    public string? Name { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Range(0, 999999.99)]
    public decimal? DailyPrice { get; set; }

    [Range(1, 10000)]
    public int? Quantity { get; set; }

    public string? Condition { get; set; }

    public Guid? CategoryId { get; set; }

    public bool? IsAvailable { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(2)]
    public string? Canton { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public string? PriceTiersJson { get; set; }
}
