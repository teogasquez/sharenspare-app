using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.DTOs;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Models.Enums;
using System.Security.Claims;

namespace ShareNSpare.Api.Controllers;

[ApiController]
[Route("equipments/{equipmentId:guid}")]
public class EquipmentBlackoutsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EquipmentBlackoutsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /equipments/{id}/availability
    [Authorize]
    [HttpGet("availability")]
    public async Task<ActionResult<EquipmentAvailabilityDto>> GetAvailability(Guid equipmentId)
    {
        var equipment = await _context.Equipments.FindAsync(equipmentId);
        if (equipment == null) return NotFound(new { message = "Équipement introuvable." });

        var blackouts = await _context.EquipmentBlackouts
            .Where(b => b.EquipmentId == equipmentId && b.EndDate >= DateTime.UtcNow.Date)
            .OrderBy(b => b.StartDate)
            .Select(b => new EquipmentBlackoutDto
            {
                Id = b.Id,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                Reason = b.Reason
            })
            .ToListAsync();

        var reservedPeriods = await _context.Reservations
            .Where(r => r.EquipmentId == equipmentId
                && (r.Status == ReservationStatus.Accepted || r.Status == ReservationStatus.InProgress)
                && r.EndDate >= DateTime.UtcNow.Date)
            .OrderBy(r => r.StartDate)
            .Select(r => new ReservedPeriodDto
            {
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                Status = r.Status.ToString()
            })
            .ToListAsync();

        return Ok(new EquipmentAvailabilityDto
        {
            Blackouts = blackouts,
            ReservedPeriods = reservedPeriods
        });
    }

    // POST /equipments/{id}/blackouts
    [Authorize]
    [HttpPost("blackouts")]
    public async Task<ActionResult<EquipmentBlackoutDto>> Create(Guid equipmentId, [FromBody] CreateBlackoutRequest request)
    {
        var orgId = GetOrganisationId();
        var equipment = await _context.Equipments
            .FirstOrDefaultAsync(e => e.Id == equipmentId && e.OrganisationId == orgId);

        if (equipment == null)
            return NotFound(new { message = "Équipement introuvable." });

        if (request.StartDate >= request.EndDate)
            return BadRequest(new { message = "La date de fin doit être après la date de début." });

        var blackout = new EquipmentBlackout
        {
            Id = Guid.NewGuid(),
            EquipmentId = equipmentId,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow
        };

        _context.EquipmentBlackouts.Add(blackout);
        await _context.SaveChangesAsync();

        return Created("", new EquipmentBlackoutDto
        {
            Id = blackout.Id,
            StartDate = blackout.StartDate,
            EndDate = blackout.EndDate,
            Reason = blackout.Reason
        });
    }

    // DELETE /equipments/{id}/blackouts/{blackoutId}
    [Authorize]
    [HttpDelete("blackouts/{blackoutId:guid}")]
    public async Task<IActionResult> Delete(Guid equipmentId, Guid blackoutId)
    {
        var orgId = GetOrganisationId();
        var blackout = await _context.EquipmentBlackouts
            .Include(b => b.Equipment)
            .FirstOrDefaultAsync(b => b.Id == blackoutId
                && b.EquipmentId == equipmentId
                && b.Equipment.OrganisationId == orgId);

        if (blackout == null)
            return NotFound(new { message = "Période introuvable." });

        _context.EquipmentBlackouts.Remove(blackout);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private Guid GetOrganisationId()
    {
        return Guid.Parse(User.FindFirstValue("organisationId")!);
    }
}
