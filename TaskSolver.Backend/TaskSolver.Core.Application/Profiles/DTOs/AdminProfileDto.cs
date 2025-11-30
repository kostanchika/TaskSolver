using TaskSolver.Core.Domain.Profiles;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Profiles.DTOs;

public sealed record AdminProfileDto(
    User User,
    string ProfileName,
    string? AvatarUrl,
    string? Bio,
    string? Description,
    IEnumerable<string> Skills,
    IEnumerable<SocialLinkDto> SocialLinks)
{
    public static AdminProfileDto FromEntity(Profile profile)
    {
        return new AdminProfileDto(
            profile.User,
            profile.ProfileName,
            profile.AvatarUrl,
            profile.Bio,
            profile.Description,
            profile.Skills,
            profile.SocialLinks.Select(SocialLinkDto.FromEntity));
    }
}
