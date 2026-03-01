using Stripe;
using Stripe.V2;

namespace ShareNSpare.Api.Services;

public class StripeService
{
    private readonly string _secretKey;
    private readonly decimal _platformFeePercent;

    public StripeService()
    {
        _secretKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")
            ?? throw new InvalidOperationException("STRIPE_SECRET_KEY not configured");
        _platformFeePercent = decimal.Parse(
            Environment.GetEnvironmentVariable("STRIPE_PLATFORM_FEE_PERCENT") ?? "15");

        StripeConfiguration.ApiKey = _secretKey;
    }

    /// <summary>
    /// Creates a Stripe Checkout Session for a reservation payment.
    /// The platform takes a 15% commission via application_fee.
    /// </summary>
    public async Task<string> CreateCheckoutSession(
        Guid reservationId,
        string equipmentName,
        decimal totalPrice,
        string successUrl,
        string cancelUrl)
    {
        var amountInCents = (long)(totalPrice * 100);
        var platformFee = (long)(amountInCents * _platformFeePercent / 100);

        var options = new Stripe.Checkout.SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            Mode = "payment",
            LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
            {
                new()
                {
                    PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                    {
                        Currency = "chf",
                        UnitAmount = amountInCents,
                        ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Location: {equipmentName}",
                            Description = $"Reservation #{reservationId.ToString()[..8]} - Commission plateforme {_platformFeePercent}% incluse"
                        }
                    },
                    Quantity = 1
                }
            },
            SuccessUrl = successUrl + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string>
            {
                { "reservationId", reservationId.ToString() },
                { "platformFee", platformFee.ToString() },
                { "platformFeePercent", _platformFeePercent.ToString() }
            }
        };

        var service = new Stripe.Checkout.SessionService();
        var session = await service.CreateAsync(options);

        return session.Url;
    }

    /// <summary>
    /// Retrieves a checkout session to verify payment status.
    /// </summary>
    public async Task<Stripe.Checkout.Session> GetCheckoutSession(string sessionId)
    {
        var service = new Stripe.Checkout.SessionService();
        return await service.GetAsync(sessionId);
    }

    public decimal PlatformFeePercent => _platformFeePercent;
}
