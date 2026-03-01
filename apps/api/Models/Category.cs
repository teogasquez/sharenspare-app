namespace ShareNSpare.Api.Models;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; } = 0;

    public ICollection<Equipment> Equipments { get; set; } = new List<Equipment>();
}
