using ShareNSpare.Api.Data;
using ShareNSpare.Api.Models;
using ShareNSpare.Api.Models.Enums;
using ShareNSpare.Api.Services;

namespace ShareNSpare.Api;

public static class SeedData
{
    private static string GetSeedPassword(string envVar, string fallback)
    {
        return Environment.GetEnvironmentVariable(envVar) ?? fallback;
    }

    public static void Initialize(AppDbContext context, PasswordHasher passwordHasher)
    {
        if (context.Users.Any() || context.Organisations.Any())
        {
            Console.WriteLine("Seed skipped: Database already contains data");
            return;
        }

        Console.WriteLine("Seeding database...");

        var adminPassword = GetSeedPassword("SEED_ADMIN_PASSWORD", "Admin123!");
        var defaultPassword = GetSeedPassword("SEED_DEFAULT_PASSWORD", "Password123!");

        // ── Categories ──
        var categories = new[]
        {
            new Category { Id = Guid.NewGuid(), Name = "Scene", Slug = "scene", Description = "Scenes, podiums, estrades", Icon = "theater", SortOrder = 1 },
            new Category { Id = Guid.NewGuid(), Name = "Son", Slug = "son", Description = "Sonorisation, enceintes, micros, tables de mixage", Icon = "speaker", SortOrder = 2 },
            new Category { Id = Guid.NewGuid(), Name = "Lumiere", Slug = "lumiere", Description = "Eclairage, projecteurs, lyres, LED", Icon = "lightbulb", SortOrder = 3 },
            new Category { Id = Guid.NewGuid(), Name = "Barrieres & Securite", Slug = "barrieres-securite", Description = "Barrieres, clotures, extincteurs, signalisation", Icon = "shield", SortOrder = 4 },
            new Category { Id = Guid.NewGuid(), Name = "Mobilier", Slug = "mobilier", Description = "Tables, chaises, bancs, comptoirs", Icon = "armchair", SortOrder = 5 },
            new Category { Id = Guid.NewGuid(), Name = "Electricite", Slug = "electricite", Description = "Groupes electrogenes, rallonges, multiprises, armoires electriques", Icon = "zap", SortOrder = 6 },
            new Category { Id = Guid.NewGuid(), Name = "Tentes & Structures", Slug = "tentes-structures", Description = "Chapiteaux, barnums, tentes, tonnelles", Icon = "tent", SortOrder = 7 },
            new Category { Id = Guid.NewGuid(), Name = "Restauration", Slug = "restauration", Description = "Frigos, fours, plaques, tireuses a biere", Icon = "utensils", SortOrder = 8 },
        };
        context.Categories.AddRange(categories);
        context.SaveChanges();

        // ── Admin Organisation ──
        var adminOrg = new Organisation
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000099"),
            Name = "ShareNSpare Admin",
            Type = OrganisationType.Pro,
            City = "Lausanne",
            Canton = "VD",
            Latitude = 46.5197,
            Longitude = 6.6323,
            IsVerified = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Organisations.Add(adminOrg);
        context.SaveChanges();

        // ── Admin User ──
        var admin = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000100"),
            Email = "admin@sharenspare.ch",
            PasswordHash = passwordHasher.HashPassword(adminPassword),
            FirstName = "Admin",
            LastName = "ShareNSpare",
            Role = UserRole.Admin,
            OrganisationId = adminOrg.Id,
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(admin);
        context.SaveChanges();

        // ── Festival: Montreux Jazz ──
        var mjOrg = new Organisation
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Name = "Montreux Jazz Festival",
            Type = OrganisationType.Festival,
            Description = "Le plus grand festival de jazz au monde",
            City = "Montreux",
            Canton = "VD",
            Latitude = 46.4312,
            Longitude = 6.9107,
            IsVerified = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Organisations.Add(mjOrg);
        context.SaveChanges();

        var mjUser = new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
            Email = "festival@example.com",
            PasswordHash = passwordHasher.HashPassword(defaultPassword),
            FirstName = "Jean",
            LastName = "Dupont",
            Role = UserRole.Festival,
            OrganisationId = mjOrg.Id,
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(mjUser);
        context.SaveChanges();

        // ── Festival: Paleo ──
        var paleoOrg = new Organisation
        {
            Id = Guid.NewGuid(),
            Name = "Paleo Festival",
            Type = OrganisationType.Festival,
            Description = "Le plus grand festival open air de Suisse",
            City = "Nyon",
            Canton = "VD",
            Latitude = 46.3833,
            Longitude = 6.2398,
            IsVerified = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Organisations.Add(paleoOrg);
        context.SaveChanges();

        var paleoUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "paleo@example.com",
            PasswordHash = passwordHasher.HashPassword(defaultPassword),
            FirstName = "Marie",
            LastName = "Martin",
            Role = UserRole.Festival,
            OrganisationId = paleoOrg.Id,
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(paleoUser);
        context.SaveChanges();

        // ── Sample equipment for Montreux Jazz ──
        var sceneCategory = categories[0];
        var sonCategory = categories[1];
        var barrieresCategory = categories[3];

        var equipments = new[]
        {
            new Equipment
            {
                Id = Guid.NewGuid(),
                Name = "Scene principale 12x8m",
                Description = "Scene modulaire aluminium avec plancher, garde-corps et escaliers",
                DailyPrice = 850.00m,
                Quantity = 1,
                Condition = EquipmentCondition.Bon,
                IsAvailable = true,
                OrganisationId = mjOrg.Id,
                CategoryId = sceneCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Equipment
            {
                Id = Guid.NewGuid(),
                Name = "Systeme son L-Acoustics KARA II",
                Description = "Line array 12 enceintes + 6 subs, ideal pour 2000-5000 personnes",
                DailyPrice = 1200.00m,
                Quantity = 1,
                Condition = EquipmentCondition.Excellent,
                IsAvailable = true,
                OrganisationId = mjOrg.Id,
                CategoryId = sonCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Equipment
            {
                Id = Guid.NewGuid(),
                Name = "Barrieres Vauban",
                Description = "Barrieres de securite en acier galvanise, 2m x 1.1m",
                DailyPrice = 5.00m,
                Quantity = 200,
                Condition = EquipmentCondition.Bon,
                IsAvailable = true,
                OrganisationId = mjOrg.Id,
                CategoryId = barrieresCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
        };
        context.Equipments.AddRange(equipments);
        context.SaveChanges();

        // ── Particulier: compte test ──
        var partOrg = new Organisation
        {
            Id = Guid.NewGuid(),
            Name = "Pierre Muller",
            Type = OrganisationType.Particulier,
            City = "Geneve",
            Canton = "GE",
            Latitude = 46.2044,
            Longitude = 6.1432,
            IsVerified = false,
            CreatedAt = DateTime.UtcNow
        };
        context.Organisations.Add(partOrg);
        context.SaveChanges();

        var partUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "particulier@example.com",
            PasswordHash = passwordHasher.HashPassword(defaultPassword),
            FirstName = "Pierre",
            LastName = "Muller",
            Role = UserRole.Particulier,
            OrganisationId = partOrg.Id,
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(partUser);
        context.SaveChanges();

        // ── Sample equipment for Particulier ──
        var mobilierCategory = categories[4];
        var tentesCategory = categories[6];

        var partEquipments = new[]
        {
            new Equipment
            {
                Id = Guid.NewGuid(),
                Name = "Tonnelle pliante 3x3m",
                Description = "Tonnelle pliante avec parois laterales, ideale pour marches et petits evenements",
                DailyPrice = 35.00m,
                Quantity = 2,
                Condition = EquipmentCondition.Bon,
                IsAvailable = true,
                OrganisationId = partOrg.Id,
                CategoryId = tentesCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Equipment
            {
                Id = Guid.NewGuid(),
                Name = "Lot 10 tables pliantes",
                Description = "Tables pliantes 180x75cm, transport facile",
                DailyPrice = 15.00m,
                Quantity = 10,
                Condition = EquipmentCondition.Correct,
                IsAvailable = true,
                OrganisationId = partOrg.Id,
                CategoryId = mobilierCategory.Id,
                CreatedAt = DateTime.UtcNow
            },
        };
        context.Equipments.AddRange(partEquipments);
        context.SaveChanges();

        Console.WriteLine("Seed completed:");
        Console.WriteLine($"   - {categories.Length} categories");
        Console.WriteLine($"   - 4 users (admin, 2 festivals, 1 particulier)");
        Console.WriteLine($"   - {equipments.Length + partEquipments.Length} equipements de demo");
    }
}
