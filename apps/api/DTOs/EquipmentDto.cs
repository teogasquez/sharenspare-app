namespace ShareNSpare.Api.DTOs;

public class EquipmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DailyPrice { get; set; }
    public string? PriceTiersJson { get; set; }
    public int Quantity { get; set; }
    public string Condition { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Canton { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public CategoryDto Category { get; set; } = null!;
    public OrganisationDto Organisation { get; set; } = null!;
    public List<EquipmentPhotoDto> Photos { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class EquipmentPhotoDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class EquipmentListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal DailyPrice { get; set; }
    public int Quantity { get; set; }
    public string Condition { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string OrganisationName { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Canton { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? PrimaryPhotoUrl { get; set; }
}
