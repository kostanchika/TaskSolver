using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class ChangeEmailHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeEmailCommand, Result>
{
    public async ValueTask<Result> HandleAsync(ChangeEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        user.ChangeEmail(request.Email);

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
