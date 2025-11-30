using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users;
using TaskSolver.Infrastructure.Auth.Configurations;

namespace TaskSolver.Infrastructure.Auth;

public sealed class JwtTokenGenerator(IOptions<JwtConfiguration> jwtConfigurationOptions)
    : ITokenGenerator
{
    private readonly JwtConfiguration _jwtConfiguration = jwtConfigurationOptions.Value;
    public string GenerateAccessToken(User user)
    {
        Claim[] claims = [
             new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
             new Claim(JwtRegisteredClaimNames.Email, user.Email),
             new Claim(ClaimTypes.Role, user.Role)
        ];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfiguration.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtConfiguration.Issuer,
            audience: _jwtConfiguration.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken(User user)
    {
        Claim[] claims = [
             new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
             new Claim("type", "refresh")
        ];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfiguration.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtConfiguration.Issuer,
            audience: _jwtConfiguration.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Result<Guid> GetUserIdFromRefreshToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtConfiguration.Key);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _jwtConfiguration.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtConfiguration.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var typeClaim = principal.Claims.FirstOrDefault(c => c.Type == "type");
            if (typeClaim?.Value != "refresh")
            {
                return Result<Guid>.Fail("Неверный тип токена", ErrorCode.BadRequest);
            }

            var subClaim = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (subClaim is null || !Guid.TryParse(subClaim.Value, out var userId))
            {
                return Result<Guid>.Fail("Не удалось извлечь идентификатор пользователя", ErrorCode.BadRequest);
            }

            return Result.Ok(userId);
        }
        catch (Exception ex)
        {
            return Result<Guid>.Fail($"Ошибка валидации токена: {ex.Message}", ErrorCode.Unauthorized);
        }


    }
}
