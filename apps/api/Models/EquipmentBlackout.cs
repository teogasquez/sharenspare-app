namespace ShareNSpare.Api.Models;

public class EquipmentBlackout
{
    public Guid Id { get; set; }
    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
