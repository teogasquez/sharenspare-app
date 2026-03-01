using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Models.Enums;
using ShareNSpare.Api.Services;
using System.Security.Claims;

namespace ShareNSpare.Api.Controllers;

[ApiController]
[Route("payments")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly StripeService _stripe;

    public PaymentsController(AppDbContext context, StripeService stripe)
    {
        _context = context;
        _stripe = stripe;
    }

    /// <summary>
    /// Create a Stripe Checkout session for an accepted reservation.
    /// Only the requester can pay.
    /// </summary>
    [Authorize]
    [HttpPost("{reservationId:guid}/checkout")]
    public async Task<ActionResult> CreateCheckout(Guid reservationId)
    {
        var orgId = Guid.Parse(User.FindFirstValue("organisationId")!);

        var reservation = await _context.Reservations
            .Include(r => r.Equipment)
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.RequesterOrganisationId == orgId);

        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });

        if (reservation.Status != ReservationStatus.Accepted)
            return BadRequest(new { message = "Payment is only available for accepted reservations" });

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";

        var checkoutUrl = await _stripe.CreateCheckoutSession(
            reservation.Id,
            reservation.Equipment.Name,
            reservation.TotalPrice,
            $"{frontendUrl}/reservations",
            $"{frontendUrl}/reservations"
        );

        return Ok(new { url = checkoutUrl });
    }

    /// <summary>
    /// Confirm payment after Stripe checkout success.
    /// Called by frontend with the session_id.
    /// </summary>
    [Authorize]
    [HttpPost("{reservationId:guid}/confirm")]
    public async Task<ActionResult> ConfirmPayment(Guid reservationId, [FromBody] ConfirmPaymentRequest request)
    {
        var orgId = Guid.Parse(User.FindFirstValue("organisationId")!);

        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.RequesterOrganisationId == orgId);

        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });

        // Verify session with Stripe
        var session = await _stripe.GetCheckoutSession(request.SessionId);

        if (session.PaymentStatus != "paid")
            return BadRequest(new { message = "Payment not completed" });

        var metaReservationId = session.Metadata.GetValueOrDefault("reservationId");
        if (metaReservationId != reservationId.ToString())
            return BadRequest(new { message = "Payment session does not match reservation" });

        // Check if already recorded
        var existing = await _context.Payments.AnyAsync(p => p.StripePaymentIntentId == session.PaymentIntentId);
        if (existing)
            return Ok(new { message = "Payment already recorded" });

        // Record payment
        var platformFee = long.Parse(session.Metadata.GetValueOrDefault("platformFee") ?? "0");

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            ReservationId = reservationId,
            StripePaymentIntentId = session.PaymentIntentId,
            Amount = reservation.TotalPrice,
            PlatformFeeAmount = platformFee / 100m,
            PlatformFeePercent = _stripe.PlatformFeePercent,
            Currency = "CHF",
            Status = PaymentStatus.Completed,
            Method = PaymentMethod.Stripe,
            CreatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Payment confirmed", paymentId = payment.Id });
    }
}

public class ConfirmPaymentRequest
{
    public string SessionId { get; set; } = null!;
}
