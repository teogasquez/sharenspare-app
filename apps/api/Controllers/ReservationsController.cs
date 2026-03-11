using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.DTOs;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Models.Enums;
using System.Security.Claims;

namespace ShareNSpare.Api.Controllers;

[Authorize]
[ApiController]
[Route("reservations")]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReservationDto>>> GetMyReservations([FromQuery] string? role)
    {
        var orgId = GetOrganisationId();

        var query = _context.Reservations
            .Include(r => r.Equipment).ThenInclude(e => e.Category)
            .Include(r => r.Equipment).ThenInclude(e => e.Organisation)
            .Include(r => r.Equipment).ThenInclude(e => e.Photos)
            .Include(r => r.RequesterOrganisation)
            .Include(r => r.OwnerOrganisation)
            .AsQueryable();

        if (role == "owner")
            query = query.Where(r => r.OwnerOrganisationId == orgId);
        else if (role == "requester")
            query = query.Where(r => r.RequesterOrganisationId == orgId);
        else
            query = query.Where(r => r.RequesterOrganisationId == orgId || r.OwnerOrganisationId == orgId);

        var reservations = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reservations.Select(MapReservationDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReservationDto>> GetById(Guid id)
    {
        var orgId = GetOrganisationId();

        var reservation = await _context.Reservations
            .Include(r => r.Equipment).ThenInclude(e => e.Category)
            .Include(r => r.Equipment).ThenInclude(e => e.Organisation)
            .Include(r => r.Equipment).ThenInclude(e => e.Photos)
            .Include(r => r.RequesterOrganisation)
            .Include(r => r.OwnerOrganisation)
            .FirstOrDefaultAsync(r => r.Id == id &&
                (r.RequesterOrganisationId == orgId || r.OwnerOrganisationId == orgId));

        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });

        return Ok(MapReservationDto(reservation));
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request)
    {
        var orgId = GetOrganisationId();

        var equipment = await _context.Equipments
            .Include(e => e.Category)
            .Include(e => e.Organisation)
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.Id == request.EquipmentId && e.IsAvailable);

        if (equipment == null)
            return NotFound(new { message = "Equipment not found or not available" });

        if (equipment.OrganisationId == orgId)
            return BadRequest(new { message = "Cannot reserve your own equipment" });

        if (request.Quantity > equipment.Quantity)
            return BadRequest(new { message = $"Only {equipment.Quantity} available" });

        if (request.StartDate >= request.EndDate)
            return BadRequest(new { message = "End date must be after start date" });

        if (request.StartDate < DateTime.UtcNow.Date)
            return BadRequest(new { message = "Start date cannot be in the past" });

        // Check against blackout periods
        var startUtc = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        var endUtc = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

        var hasBlackoutConflict = await _context.EquipmentBlackouts
            .AnyAsync(b => b.EquipmentId == request.EquipmentId
                && b.StartDate < endUtc
                && b.EndDate > startUtc);

        if (hasBlackoutConflict)
            return BadRequest(new { message = "Les dates sélectionnées chevauchent une période d'indisponibilité." });

        // Check against existing accepted/in-progress reservations
        var hasReservationConflict = await _context.Reservations
            .AnyAsync(r => r.EquipmentId == request.EquipmentId
                && (r.Status == ReservationStatus.Accepted || r.Status == ReservationStatus.InProgress)
                && r.StartDate < endUtc
                && r.EndDate > startUtc);

        if (hasReservationConflict)
            return BadRequest(new { message = "Les dates sélectionnées chevauchent une réservation existante." });

        // Calculate pricing
        var days = (int)Math.Ceiling((request.EndDate - request.StartDate).TotalDays);
        var unitPrice = equipment.DailyPrice;
        var totalPrice = unitPrice * days * request.Quantity;

        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            EquipmentId = equipment.Id,
            Quantity = request.Quantity,
            RequesterOrganisationId = orgId,
            OwnerOrganisationId = equipment.OrganisationId,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
            UnitPrice = unitPrice,
            TotalPrice = totalPrice,
            Status = ReservationStatus.Pending,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        // Reload
        reservation.Equipment = equipment;
        reservation.RequesterOrganisation = await _context.Organisations.FindAsync(orgId)
            ?? throw new InvalidOperationException("Organisation introuvable pour l'utilisateur courant.");
        reservation.OwnerOrganisation = equipment.Organisation;

        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, MapReservationDto(reservation));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ReservationDto>> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusRequest request)
    {
        var orgId = GetOrganisationId();

        var reservation = await _context.Reservations
            .Include(r => r.Equipment).ThenInclude(e => e.Category)
            .Include(r => r.Equipment).ThenInclude(e => e.Organisation)
            .Include(r => r.Equipment).ThenInclude(e => e.Photos)
            .Include(r => r.RequesterOrganisation)
            .Include(r => r.OwnerOrganisation)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null)
            return NotFound(new { message = "Reservation not found" });

        if (!Enum.TryParse<ReservationStatus>(request.Status, out var newStatus))
            return BadRequest(new { message = "Invalid status" });

        // Validate transitions
        var isOwner = reservation.OwnerOrganisationId == orgId;
        var isRequester = reservation.RequesterOrganisationId == orgId;

        if (!isOwner && !isRequester)
            return Forbid();

        var validTransition = (reservation.Status, newStatus, isOwner) switch
        {
            
            (ReservationStatus.Pending, ReservationStatus.Accepted, true) => true,
            (ReservationStatus.Pending, ReservationStatus.Rejected, true) => true,
            (ReservationStatus.Pending, ReservationStatus.Cancelled, false) => true,
            
            
            
            (ReservationStatus.Accepted, ReservationStatus.InProgress, true) => true,
            (ReservationStatus.Accepted, ReservationStatus.Cancelled, false) => true,
            (ReservationStatus.InProgress, ReservationStatus.Returned, true) => true,
            (ReservationStatus.Returned, ReservationStatus.Closed, true) => true,
            _ => false
        };

        if (!validTransition)
            return BadRequest(new { message = $"Cannot transition from {reservation.Status} to {newStatus}" });

        reservation.Status = newStatus;
        if (request.Note != null)
            reservation.OwnerNote = request.Note;
        reservation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapReservationDto(reservation));
    }

    private Guid GetOrganisationId()
    {
        return Guid.Parse(User.FindFirstValue("organisationId")!);
    }

    private static ReservationDto MapReservationDto(Reservation r) => new()
    {
        Id = r.Id,
        Quantity = r.Quantity,
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        UnitPrice = r.UnitPrice,
        TotalPrice = r.TotalPrice,
        Status = r.Status.ToString(),
        Message = r.Message,
        OwnerNote = r.OwnerNote,
        CreatedAt = r.CreatedAt,
        Equipment = new EquipmentListDto
        {
            Id = r.Equipment.Id,
            Name = r.Equipment.Name,
            Description = r.Equipment.Description,
            DailyPrice = r.Equipment.DailyPrice,
            Quantity = r.Equipment.Quantity,
            Condition = r.Equipment.Condition.ToString(),
            IsAvailable = r.Equipment.IsAvailable,
            CategoryName = r.Equipment.Category.Name,
            CategorySlug = r.Equipment.Category.Slug,
            OrganisationName = r.Equipment.Organisation.Name,
            City = r.Equipment.Organisation.City,
            Canton = r.Equipment.Organisation.Canton,
            PrimaryPhotoUrl = r.Equipment.Photos.Where(p => p.IsPrimary).Select(p => p.Url).FirstOrDefault()
        },
        RequesterOrganisation = MapOrgDto(r.RequesterOrganisation),
        OwnerOrganisation = MapOrgDto(r.OwnerOrganisation)
    };

    private static OrganisationDto MapOrgDto(Organisation o) => new()
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
    };
}
