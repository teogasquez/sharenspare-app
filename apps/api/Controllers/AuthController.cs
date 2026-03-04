using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.DTOs;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Models.Enums;
using ShareNSpare.Api.Services;
using System.Security.Claims;

namespace ShareNSpare.Api.Controllers;

[ApiController]
[Route("auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthController(AppDbContext context, PasswordHasher passwordHasher, JwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Organisation)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Account is deactivated" });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        var expiresAt = _jwtService.GetTokenExpiration();

        return Ok(new LoginResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = MapUserDto(user)
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        // Password strength validation
        if (request.Password.Length < 8 ||
            !request.Password.Any(char.IsUpper) ||
            !request.Password.Any(char.IsDigit))
        {
            return BadRequest(new { message = "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre." });
        }

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return Conflict(new { message = "Email already registered" });
        }

        Organisation organisation;
        UserRole role;

        if (!string.IsNullOrEmpty(request.InvitationToken))
        {
            // Invited registration (festival / pro)
            var invitation = await _context.Invitations
                .FirstOrDefaultAsync(i => i.Token == request.InvitationToken && i.UsedAt == null);

            if (invitation == null || invitation.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired invitation" });
            }

            role = invitation.Role;
            var orgType = role == UserRole.Festival ? OrganisationType.Festival : OrganisationType.Pro;

            organisation = new Organisation
            {
                Id = Guid.NewGuid(),
                Name = invitation.OrganisationName,
                Type = orgType,
                CreatedAt = DateTime.UtcNow
            };
            _context.Organisations.Add(organisation);

            invitation.UsedAt = DateTime.UtcNow;
        }
        else
        {
            return BadRequest(new { message = "L'inscription est sur invitation uniquement." });
        }

        await _context.SaveChangesAsync();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Role = role,
            OrganisationId = organisation.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Reload with organisation
        user.Organisation = organisation;

        var token = _jwtService.GenerateToken(user);
        var expiresAt = _jwtService.GetTokenExpiration();

        return CreatedAtAction(nameof(Login), new LoginResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = MapUserDto(user)
        });
    }

    [HttpPost("init-admin")]
    public async Task<IActionResult> InitAdmin([FromBody] InitAdminRequest request)
    {
        var setupSecret = Environment.GetEnvironmentVariable("ADMIN_SETUP_SECRET");
        if (string.IsNullOrEmpty(setupSecret) || request.Secret != setupSecret)
            return Unauthorized(new { message = "Invalid setup secret" });

        if (await _context.Users.AnyAsync(u => u.Role == UserRole.Admin))
            return Conflict(new { message = "An admin account already exists" });

        var adminOrg = new Organisation
        {
            Id = Guid.NewGuid(),
            Name = "ShareNSpare Admin",
            Type = OrganisationType.Pro,
            IsVerified = true,
            CreatedAt = DateTime.UtcNow
        };
        _context.Organisations.Add(adminOrg);

        var admin = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = "Admin",
            LastName = "ShareNSpare",
            Role = UserRole.Admin,
            OrganisationId = adminOrg.Id,
            CreatedAt = DateTime.UtcNow
        };
        _context.Users.Add(admin);
        await _context.SaveChangesAsync();

        admin.Organisation = adminOrg;
        return Ok(new { message = "Admin account created", email = admin.Email });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }

    private static UserDto MapUserDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Phone = user.Phone,
        Role = user.Role.ToString(),
        IsActive = user.IsActive,
        LastLoginAt = user.LastLoginAt,
        Organisation = new OrganisationDto
        {
            Id = user.Organisation.Id,
            Name = user.Organisation.Name,
            Type = user.Organisation.Type.ToString(),
            Description = user.Organisation.Description,
            LogoUrl = user.Organisation.LogoUrl,
            Phone = user.Organisation.Phone,
            Website = user.Organisation.Website,
            Address = user.Organisation.Address,
            City = user.Organisation.City,
            Canton = user.Organisation.Canton,
            IsVerified = user.Organisation.IsVerified
        }
    };
}
