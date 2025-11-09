using TaskSolver.Core.Application.Profiles.Commands;
using TaskSolver.Core.Application.Profiles.DTOs;

namespace TaskSolver.Api.Controllers.Users.Requests;

public sealed record UpdateProfileRequest(
    string ProfileName,
    string? Bio,
    string? Description,
    IEnumerable<string> Skills,
    IEnumerable<SocialLinkDto> SocialLinks)
{
    public UpdateProfileCommand ToCommand(Guid userId)
        => new(
            userId,
            ProfileName,
            Bio,
            Description,
            Skills,
            SocialLinks);
}
