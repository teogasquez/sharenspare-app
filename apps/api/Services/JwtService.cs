using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ShareNSpare.Api.Models;

namespace ShareNSpare.Api.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var secret = Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT_SECRET not configured");
        
        var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
            ?? _configuration["Jwt:Issuer"]
            ?? "ShareNSpare";
        
        var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
            ?? _configuration["Jwt:Audience"]
            ?? "ShareNSpare";
        
        var expirationHours = int.Parse(
            Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS")
            ?? _configuration["Jwt:ExpirationHours"]
            ?? "24"
        );

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("organisationId", user.OrganisationId.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public DateTime GetTokenExpiration()
    {
        var expirationHours = int.Parse(
            Environment.GetEnvironmentVariable("JWT_EXPIRATION_HOURS")
            ?? _configuration["Jwt:ExpirationHours"]
            ?? "24"
        );
        return DateTime.UtcNow.AddHours(expirationHours);
    }
}