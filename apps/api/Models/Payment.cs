using ShareNSpare.Api.Models.Enums;

namespace ShareNSpare.Api.Models;

public class Payment
{
    public Guid Id { get; set; }

    public Guid ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;

    public string? StripePaymentIntentId { get; set; }
    public decimal Amount { get; set; }
    public decimal PlatformFeeAmount { get; set; }
    public decimal PlatformFeePercent { get; set; }
    public string Currency { get; set; } = "CHF";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentMethod Method { get; set; } = PaymentMethod.Stripe;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
