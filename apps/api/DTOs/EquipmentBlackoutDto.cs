using System.ComponentModel.DataAnnotations;

namespace ShareNSpare.Api.DTOs;

public class EquipmentBlackoutDto
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}

public class CreateBlackoutRequest
{
    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}

public class ReservedPeriodDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class EquipmentAvailabilityDto
{
    public List<EquipmentBlackoutDto> Blackouts { get; set; } = new();
    public List<ReservedPeriodDto> ReservedPeriods { get; set; } = new();
}
