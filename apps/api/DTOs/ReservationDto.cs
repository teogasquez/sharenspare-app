namespace ShareNSpare.Api.DTOs;

public class ReservationDto
{
    public Guid Id { get; set; }
    public EquipmentListDto Equipment { get; set; } = null!;
    public int Quantity { get; set; }
    public OrganisationDto RequesterOrganisation { get; set; } = null!;
    public OrganisationDto OwnerOrganisation { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? OwnerNote { get; set; }
    public DateTime CreatedAt { get; set; }
}
