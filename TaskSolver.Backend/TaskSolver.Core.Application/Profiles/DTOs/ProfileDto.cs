using TaskSolver.Core.Domain.Profiles;

namespace TaskSolver.Core.Application.Profiles.DTOs;

public sealed record ProfileDto(
    Guid UserId,
    string ProfileName,
    string? AvatarUrl,
    string? Bio,
    string? Description,
    IEnumerable<string> Skills,
    IEnumerable<SocialLinkDto> SocialLinks)
{
    public static ProfileDto FromEntity(Profile profile)
    {
        return new ProfileDto(
            profile.User.Id,
            profile.ProfileName,
            profile.AvatarUrl,
            profile.Bio,
            profile.Description,
            profile.Skills,
            profile.SocialLinks.Select(SocialLinkDto.FromEntity));
    }
}
