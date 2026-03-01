using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Data;
using ShareNSpare.Api.DTOs;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Services;
using System.Security.Claims;

namespace ShareNSpare.Api.Controllers;

[ApiController]
[Route("equipments/{equipmentId:guid}/photos")]
[Authorize]
public class PhotosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly StorageService _storage;

    public PhotosController(AppDbContext context, StorageService storage)
    {
        _context = context;
        _storage = storage;
    }

    [HttpPost]
    public async Task<ActionResult<EquipmentPhotoDto>> Upload(Guid equipmentId, IFormFile file)
    {
        var orgId = Guid.Parse(User.FindFirstValue("organisationId")!);

        var equipment = await _context.Equipments
            .Include(e => e.Photos)
            .FirstOrDefaultAsync(e => e.Id == equipmentId && e.OrganisationId == orgId);

        if (equipment == null)
            return NotFound(new { message = "Equipment not found" });

        if (file.Length == 0)
            return BadRequest(new { message = "Empty file" });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File too large (max 5MB)" });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { message = "Only JPEG, PNG and WebP are allowed" });

        using var stream = file.OpenReadStream();
        var url = await _storage.UploadAsync(stream, file.FileName, file.ContentType);

        var isPrimary = !equipment.Photos.Any();
        var sortOrder = equipment.Photos.Count;

        var photo = new EquipmentPhoto
        {
            Id = Guid.NewGuid(),
            EquipmentId = equipmentId,
            Url = url,
            IsPrimary = isPrimary,
            SortOrder = sortOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.EquipmentPhotos.Add(photo);
        await _context.SaveChangesAsync();

        return Ok(new EquipmentPhotoDto
        {
            Id = photo.Id,
            Url = photo.Url,
            IsPrimary = photo.IsPrimary,
            SortOrder = photo.SortOrder
        });
    }

    [HttpDelete("{photoId:guid}")]
    public async Task<IActionResult> Delete(Guid equipmentId, Guid photoId)
    {
        var orgId = Guid.Parse(User.FindFirstValue("organisationId")!);

        var photo = await _context.EquipmentPhotos
            .Include(p => p.Equipment)
            .FirstOrDefaultAsync(p => p.Id == photoId && p.EquipmentId == equipmentId && p.Equipment.OrganisationId == orgId);

        if (photo == null)
            return NotFound(new { message = "Photo not found" });

        await _storage.DeleteAsync(photo.Url);

        _context.EquipmentPhotos.Remove(photo);

        // If we deleted the primary, make the next one primary
        if (photo.IsPrimary)
        {
            var next = await _context.EquipmentPhotos
                .Where(p => p.EquipmentId == equipmentId && p.Id != photoId)
                .OrderBy(p => p.SortOrder)
                .FirstOrDefaultAsync();
            if (next != null) next.IsPrimary = true;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{photoId:guid}/primary")]
    public async Task<IActionResult> SetPrimary(Guid equipmentId, Guid photoId)
    {
        var orgId = Guid.Parse(User.FindFirstValue("organisationId")!);

        var photos = await _context.EquipmentPhotos
            .Include(p => p.Equipment)
            .Where(p => p.EquipmentId == equipmentId && p.Equipment.OrganisationId == orgId)
            .ToListAsync();

        if (!photos.Any(p => p.Id == photoId))
            return NotFound(new { message = "Photo not found" });

        foreach (var p in photos)
            p.IsPrimary = p.Id == photoId;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
