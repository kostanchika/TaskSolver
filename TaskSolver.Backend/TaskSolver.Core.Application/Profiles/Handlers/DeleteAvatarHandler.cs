using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Profiles.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Handlers;

public sealed class DeleteAvatarHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteAvatarCommand, Result>
{
    public async ValueTask<Result> HandleAsync(DeleteAvatarCommand request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.Profiles.GetByUserIdAsync(request.UserId, cancellationToken);
        if (profile is null)
        {
            return Result.Fail("Профиль не найден", ErrorCode.NotFound);
        }

        profile.AvatarUrl = null;

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
