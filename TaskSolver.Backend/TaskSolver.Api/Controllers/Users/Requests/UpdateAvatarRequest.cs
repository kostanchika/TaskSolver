using TaskSolver.Api.Extensions;
using TaskSolver.Core.Application.Profiles.Commands;

namespace TaskSolver.Api.Controllers.Users.Requests;

public sealed record UpdateAvatarRequest(
    IFormFile Avatar)
{
    public UpdateAvatarCommand ToCommand(Guid userId)
        => new(userId, Avatar.ToUploadedFile());
}
