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
[Route("equipments")]
public class EquipmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    // Coordonnees GPS approximatives par canton suisse
    private static readonly Dictionary<string, (double Lat, double Lng)> CantonCoords = new()
    {
        ["AG"] = (47.3900, 8.0455), ["AI"] = (47.3317, 9.4100), ["AR"] = (47.3833, 9.2833),
        ["BE"] = (46.9480, 7.4474), ["BL"] = (47.4417, 7.7633), ["BS"] = (47.5596, 7.5886),
        ["FR"] = (46.8065, 7.1620), ["GE"] = (46.2044, 6.1432), ["GL"] = (47.0400, 9.0683),
        ["GR"] = (46.8508, 9.5320), ["JU"] = (47.3667, 7.3500), ["LU"] = (47.0505, 8.3064),
        ["NE"] = (46.9900, 6.9293), ["NW"] = (46.9570, 8.3650), ["OW"] = (46.8960, 8.2460),
        ["SG"] = (47.4245, 9.3767), ["SH"] = (47.6960, 8.6350), ["SO"] = (47.2088, 7.5338),
        ["SZ"] = (47.0208, 8.6528), ["TG"] = (47.5536, 9.0750), ["TI"] = (46.1983, 9.0236),
        ["UR"] = (46.8800, 8.6440), ["VD"] = (46.5197, 6.6323), ["VS"] = (46.2333, 7.3600),
        ["ZG"] = (47.1724, 8.5173), ["ZH"] = (47.3769, 8.5417),
    };

    public EquipmentsController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<EquipmentListDto>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? city,
        [FromQuery] string? canton,
        [FromQuery] string? search,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] double? lat,
        [FromQuery] double? lng,
        [FromQuery] double? radius)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        var query = _context.Equipments
            .Include(e => e.Category)
            .Include(e => e.Organisation)
            .Include(e => e.Photos)
            .Where(e => e.IsAvailable)
            .AsQueryable();

        // Exclude own equipment from catalogue
        var orgId = Guid.Parse(User.FindFirstValue("organisationId")!);
        query = query.Where(e => e.OrganisationId != orgId);

        // B2B/C2C separation: Festival sees only Festival, Particulier sees only Particulier
        if (role == "Festival")
            query = query.Where(e => e.Organisation.Type == OrganisationType.Festival);
        else if (role == "Particulier")
            query = query.Where(e => e.Organisation.Type == OrganisationType.Particulier);
        // Admin sees everything

        if (!string.IsNullOrEmpty(category))
            query = query.Where(e => e.Category.Slug == category);

        if (!string.IsNullOrEmpty(city))
            query = query.Where(e => e.Organisation.City != null && e.Organisation.City.ToLower().Contains(city.ToLower()));

        if (!string.IsNullOrEmpty(canton))
            query = query.Where(e => e.Organisation.Canton == canton);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(e => e.Name.ToLower().Contains(search.ToLower()) ||
                                     (e.Description != null && e.Description.ToLower().Contains(search.ToLower())));

        if (minPrice.HasValue)
            query = query.Where(e => e.DailyPrice >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(e => e.DailyPrice <= maxPrice.Value);

        // Geo filter: bounding box on equipment's own coordinates
        if (lat.HasValue && lng.HasValue && radius.HasValue)
        {
            query = query.Where(e => e.Latitude != null && e.Longitude != null);
            var latRad = lat.Value * Math.PI / 180;
            var degPerKmLat = 1.0 / 111.0;
            var degPerKmLng = 1.0 / (111.0 * Math.Cos(latRad));
            var dLat = radius.Value * degPerKmLat;
            var dLng = radius.Value * degPerKmLng;
            query = query.Where(e =>
                e.Latitude!.Value >= lat.Value - dLat &&
                e.Latitude!.Value <= lat.Value + dLat &&
                e.Longitude!.Value >= lng.Value - dLng &&
                e.Longitude!.Value <= lng.Value + dLng);
        }

        var equipments = await query
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EquipmentListDto
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                DailyPrice = e.DailyPrice,
                Quantity = e.Quantity,
                Condition = e.Condition.ToString(),
                IsAvailable = e.IsAvailable,
                CategoryName = e.Category.Name,
                CategorySlug = e.Category.Slug,
                OrganisationName = e.Organisation.Name,
                City = e.City ?? e.Organisation.City,
                Canton = e.Canton ?? e.Organisation.Canton,
                Latitude = e.Latitude,
                Longitude = e.Longitude,
                PrimaryPhotoUrl = e.Photos.Where(p => p.IsPrimary).Select(p => p.Url).FirstOrDefault()
                    ?? e.Photos.OrderBy(p => p.SortOrder).Select(p => p.Url).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(equipments);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipmentDto>> GetById(Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);

        var equipment = await _context.Equipments
            .Include(e => e.Category)
            .Include(e => e.Organisation)
            .Include(e => e.Photos.OrderBy(p => p.SortOrder))
            .FirstOrDefaultAsync(e => e.Id == id);

        if (equipment == null)
            return NotFound(new { message = "Equipment not found" });

        // B2B/C2C separation
        if (role == "Festival" && equipment.Organisation.Type != OrganisationType.Festival)
            return NotFound(new { message = "Equipment not found" });
        if (role == "Particulier" && equipment.Organisation.Type != OrganisationType.Particulier)
            return NotFound(new { message = "Equipment not found" });

        return Ok(MapEquipmentDto(equipment));
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<List<EquipmentListDto>>> GetMyEquipments()
    {
        var orgId = GetOrganisationId();

        var equipments = await _context.Equipments
            .Include(e => e.Category)
            .Include(e => e.Organisation)
            .Include(e => e.Photos)
            .Where(e => e.OrganisationId == orgId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EquipmentListDto
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                DailyPrice = e.DailyPrice,
                Quantity = e.Quantity,
                Condition = e.Condition.ToString(),
                IsAvailable = e.IsAvailable,
                CategoryName = e.Category.Name,
                CategorySlug = e.Category.Slug,
                OrganisationName = e.Organisation.Name,
                City = e.City ?? e.Organisation.City,
                Canton = e.Canton ?? e.Organisation.Canton,
                Latitude = e.Latitude,
                Longitude = e.Longitude,
                PrimaryPhotoUrl = e.Photos.Where(p => p.IsPrimary).Select(p => p.Url).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(equipments);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<EquipmentDto>> Create([FromBody] CreateEquipmentRequest request)
    {
        var orgId = GetOrganisationId();

        var category = await _context.Categories.FindAsync(request.CategoryId);
        if (category == null)
            return BadRequest(new { message = "Invalid category" });

        if (!Enum.TryParse<EquipmentCondition>(request.Condition, out var condition))
            return BadRequest(new { message = "Invalid condition" });

        var equipment = new Equipment
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            DailyPrice = request.DailyPrice,
            Quantity = request.Quantity,
            Condition = condition,
            OrganisationId = orgId,
            CategoryId = request.CategoryId,
            Address = request.Address,
            City = request.City,
            Canton = request.Canton,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IsAvailable = request.IsAvailable,
            CreatedAt = DateTime.UtcNow
        };

        _context.Equipments.Add(equipment);
        await _context.SaveChangesAsync();

        // Reload with includes
        equipment = await _context.Equipments
            .Include(e => e.Category)
            .Include(e => e.Organisation)
            .Include(e => e.Photos)
            .FirstAsync(e => e.Id == equipment.Id);

        return CreatedAtAction(nameof(GetById), new { id = equipment.Id }, MapEquipmentDto(equipment));
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EquipmentDto>> Update(Guid id, [FromBody] UpdateEquipmentRequest request)
    {
        var orgId = GetOrganisationId();

        var equipment = await _context.Equipments
            .Include(e => e.Category)
            .Include(e => e.Organisation)
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.Id == id && e.OrganisationId == orgId);

        if (equipment == null)
            return NotFound(new { message = "Equipment not found" });

        if (request.Name != null) equipment.Name = request.Name;
        if (request.Description != null) equipment.Description = request.Description;
        if (request.DailyPrice.HasValue) equipment.DailyPrice = request.DailyPrice.Value;
        if (request.Quantity.HasValue) equipment.Quantity = request.Quantity.Value;
        if (request.IsAvailable.HasValue) equipment.IsAvailable = request.IsAvailable.Value;

        if (request.Condition != null)
        {
            if (!Enum.TryParse<EquipmentCondition>(request.Condition, out var condition))
                return BadRequest(new { message = "Invalid condition" });
            equipment.Condition = condition;
        }

        if (request.CategoryId.HasValue)
        {
            var category = await _context.Categories.FindAsync(request.CategoryId.Value);
            if (category == null)
                return BadRequest(new { message = "Invalid category" });
            equipment.CategoryId = request.CategoryId.Value;
        }

        if (request.Address != null) equipment.Address = request.Address;
        if (request.City != null) equipment.City = request.City;
        if (request.Canton != null) equipment.Canton = request.Canton;
        if (request.Latitude.HasValue) equipment.Latitude = request.Latitude;
        if (request.Longitude.HasValue) equipment.Longitude = request.Longitude;

        equipment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(MapEquipmentDto(equipment));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var orgId = GetOrganisationId();

        var equipment = await _context.Equipments
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.Id == id && e.OrganisationId == orgId);

        if (equipment == null)
            return NotFound(new { message = "Equipment not found" });

        // Vérifier qu'il n'y a pas de réservations actives
        var hasActiveReservations = await _context.Reservations
            .AnyAsync(r => r.EquipmentId == id && (r.Status == ReservationStatus.Accepted || r.Status == ReservationStatus.InProgress));
        if (hasActiveReservations)
            return BadRequest(new { message = "Impossible de supprimer : des réservations actives existent." });

        // Supprimer les photos associées
        if (equipment.Photos.Any())
            _context.EquipmentPhotos.RemoveRange(equipment.Photos);

        _context.Equipments.Remove(equipment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetOrganisationId()
    {
        return Guid.Parse(User.FindFirstValue("organisationId")!);
    }

    private static EquipmentDto MapEquipmentDto(Equipment e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        Description = e.Description,
        DailyPrice = e.DailyPrice,
        Quantity = e.Quantity,
        Condition = e.Condition.ToString(),
        IsAvailable = e.IsAvailable,
        Address = e.Address,
        City = e.City,
        Canton = e.Canton,
        Latitude = e.Latitude,
        Longitude = e.Longitude,
        CreatedAt = e.CreatedAt,
        Category = new CategoryDto
        {
            Id = e.Category.Id,
            Name = e.Category.Name,
            Slug = e.Category.Slug,
            Description = e.Category.Description,
            Icon = e.Category.Icon,
            SortOrder = e.Category.SortOrder
        },
        Organisation = new OrganisationDto
        {
            Id = e.Organisation.Id,
            Name = e.Organisation.Name,
            Type = e.Organisation.Type.ToString(),
            Description = e.Organisation.Description,
            LogoUrl = e.Organisation.LogoUrl,
            Phone = e.Organisation.Phone,
            Website = e.Organisation.Website,
            Address = e.Organisation.Address,
            City = e.Organisation.City,
            Canton = e.Organisation.Canton,
            IsVerified = e.Organisation.IsVerified
        },
        Photos = e.Photos.Select(p => new EquipmentPhotoDto
        {
            Id = p.Id,
            Url = p.Url,
            IsPrimary = p.IsPrimary,
            SortOrder = p.SortOrder
        }).ToList()
    };
}
