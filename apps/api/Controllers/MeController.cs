using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.DTOs;
using System.Security.Claims;

namespace ShareNSpare.Api.Controllers;

[Authorize]
[ApiController]
[Route("me")]
public class MeController : ControllerBase
{
    private readonly AppDbContext _context;

    public MeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<UserDto>> Get()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users
            .Include(u => u.Organisation)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "User not found" });

        return Ok(MapUserDto(user));
    }

    [HttpPatch]
    public async Task<ActionResult<UserDto>> UpdateMe([FromBody] UpdateMeRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users
            .Include(u => u.Organisation)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "User not found" });

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId))
                return Conflict(new { message = "Cet email est déjà utilisé." });
            user.Email = request.Email;
        }

        if (request.Phone != null) user.Phone = request.Phone;

        await _context.SaveChangesAsync();
        return Ok(MapUserDto(user));
    }

    [HttpPatch("organisation")]
    public async Task<ActionResult<UserDto>> UpdateOrganisation([FromBody] UpdateOrganisationRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users
            .Include(u => u.Organisation)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "User not found" });

        var org = user.Organisation;
        if (!string.IsNullOrWhiteSpace(request.Name)) org.Name = request.Name;
        if (request.Website != null) org.Website = request.Website;
        if (request.City != null) org.City = request.City;
        if (request.Phone != null) org.Phone = request.Phone;
        if (request.Description != null) org.Description = request.Description;

        await _context.SaveChangesAsync();
        return Ok(MapUserDto(user));
    }

    private static UserDto MapUserDto(ShareNSpare.Api.Models.User user) => new()
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

public class UpdateMeRequest
{
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public class UpdateOrganisationRequest
{
    public string? Name { get; set; }
    public string? Website { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Description { get; set; }
}
