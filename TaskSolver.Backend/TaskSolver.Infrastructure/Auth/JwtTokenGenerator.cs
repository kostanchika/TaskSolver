using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskSolver.Core.Application.Users.Interfaces;
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
}
