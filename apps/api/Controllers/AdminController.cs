using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.DTOs;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Models.Enums;
using System.Security.Claims;
using System.Security.Cryptography;

namespace ShareNSpare.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("invitations")]
    public async Task<ActionResult<InvitationDto>> CreateInvitation([FromBody] CreateInvitationRequest request)
    {
        if (!Enum.TryParse<UserRole>(request.Role, out var role) || role == UserRole.Admin)
            return BadRequest(new { message = "Invalid role" });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            OrganisationName = request.OrganisationName,
            Role = role,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Invitations.Add(invitation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInvitations), new InvitationDto
        {
            Id = invitation.Id,
            Email = invitation.Email,
            OrganisationName = invitation.OrganisationName,
            Role = invitation.Role.ToString(),
            Token = invitation.Token,
            ExpiresAt = invitation.ExpiresAt,
            CreatedAt = invitation.CreatedAt
        });
    }

    [HttpGet("invitations")]
    public async Task<ActionResult<List<InvitationDto>>> GetInvitations()
    {
        var invitations = await _context.Invitations
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InvitationDto
            {
                Id = i.Id,
                Email = i.Email,
                OrganisationName = i.OrganisationName,
                Role = i.Role.ToString(),
                Token = i.Token,
                ExpiresAt = i.ExpiresAt,
                UsedAt = i.UsedAt,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(invitations);
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Organisation)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Phone = u.Phone,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                Organisation = new OrganisationDto
                {
                    Id = u.Organisation.Id,
                    Name = u.Organisation.Name,
                    Type = u.Organisation.Type.ToString(),
                    City = u.Organisation.City,
                    Canton = u.Organisation.Canton,
                    IsVerified = u.Organisation.IsVerified
                }
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPatch("users/{id:guid}/active")]
    public async Task<IActionResult> ToggleUserActive(Guid id, [FromBody] ToggleActiveRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        user.IsActive = request.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {(request.IsActive ? "activated" : "deactivated")}" });
    }

    [HttpGet("organisations")]
    public async Task<ActionResult<List<OrganisationDto>>> GetAllOrganisations()
    {
        var orgs = await _context.Organisations
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrganisationDto
            {
                Id = o.Id,
                Name = o.Name,
                Type = o.Type.ToString(),
                Description = o.Description,
                LogoUrl = o.LogoUrl,
                Phone = o.Phone,
                Website = o.Website,
                Address = o.Address,
                City = o.City,
                Canton = o.Canton,
                IsVerified = o.IsVerified
            })
            .ToListAsync();

        return Ok(orgs);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var today = DateTime.UtcNow.Date;
        var totalUsers = await _context.Users.CountAsync();
        var totalOrgs = await _context.Organisations.CountAsync();
        var totalEquipments = await _context.Equipments.CountAsync();

        // Reservations today
        var reservationsToday = await _context.Reservations
            .CountAsync(r => r.CreatedAt.Date == today);

        // Total completed payments = platform revenue (15% commission)
        var totalPayments = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.PlatformFeeAmount) ?? 0;

        // Total revenue all time (all completed payments total)
        var totalRevenue = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        // Active reservations (in progress)
        var activeReservations = await _context.Reservations
            .CountAsync(r => r.Status == ReservationStatus.InProgress);

        // Total reservations
        var totalReservations = await _context.Reservations.CountAsync();

        return Ok(new
        {
            totalUsers,
            totalOrgs,
            totalEquipments,
            totalReservations,
            reservationsToday,
            activeReservations,
            platformRevenue = totalPayments,
            totalRevenue,
        });
    }

    [HttpPatch("organisations/{id:guid}/verify")]
    public async Task<IActionResult> VerifyOrganisation(Guid id)
    {
        var org = await _context.Organisations.FindAsync(id);
        if (org == null)
            return NotFound(new { message = "Organisation not found" });

        org.IsVerified = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Organisation verified" });
    }
}

public class ToggleActiveRequest
{
    public bool IsActive { get; set; }
}
