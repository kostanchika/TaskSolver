using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Profiles.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Handlers;

public sealed class UpdateAvatarHandler(
    IUnitOfWork unitOfWork,
    IFileStorage fileStorage)
    : IRequestHandler<UpdateAvatarCommand, Result>
{
    public async ValueTask<Result> HandleAsync(UpdateAvatarCommand request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.Profiles.GetByUserIdAsync(request.UserId, cancellationToken);
        if (profile is null)
        {
            return Result.Fail("Профиль не найден", ErrorCode.NotFound);
        }

        var avatarUrl = await fileStorage.SaveAsync(request.Avatar, "avatars", cancellationToken: cancellationToken);
        profile.AvatarUrl = avatarUrl;

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
