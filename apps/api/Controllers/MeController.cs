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

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(new UserDto
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
        });
    }
}
