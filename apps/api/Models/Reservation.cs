using ShareNSpare.Api.Models.Enums;

namespace ShareNSpare.Api.Models;

public class Reservation
{
    public Guid Id { get; set; }

    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
    public int Quantity { get; set; } = 1;

    public Guid RequesterOrganisationId { get; set; }
    public Organisation RequesterOrganisation { get; set; } = null!;

    public Guid OwnerOrganisationId { get; set; }
    public Organisation OwnerOrganisation { get; set; } = null!;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public string? Message { get; set; }
    public string? OwnerNote { get; set; }

    public Payment? Payment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
