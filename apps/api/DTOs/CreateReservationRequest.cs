using System.ComponentModel.DataAnnotations;

namespace ShareNSpare.Api.DTOs;

public class CreateReservationRequest
{
    [Required]
    public Guid EquipmentId { get; set; }

    [Range(1, 10000)]
    public int Quantity { get; set; } = 1;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [MaxLength(2000)]
    public string? Message { get; set; }
}

public class UpdateReservationStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Note { get; set; }
}
