namespace ShareNSpare.Api.Models;

public class EquipmentPhoto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;
    public int SortOrder { get; set; } = 0;

    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
