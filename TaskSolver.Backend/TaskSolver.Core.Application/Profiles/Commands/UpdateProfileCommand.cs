using MitMediator;
using TaskSolver.Core.Application.Profiles.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Commands;

public sealed record UpdateProfileCommand(
    Guid UserId,
    string ProfileName,
    string? Bio,
    string? Description,
    IEnumerable<string> Skills,
    IEnumerable<SocialLinkDto> SocialLinks
) : IRequest<Result>;