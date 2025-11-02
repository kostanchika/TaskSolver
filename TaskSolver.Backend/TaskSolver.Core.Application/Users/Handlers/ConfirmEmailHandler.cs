using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class ConfirmEmailHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<ConfirmEmailCommand, Result>
{
    public async ValueTask<Result> HandleAsync(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var confirmEmailResult = user.ConfirmEmail(request.Code);
        if (!confirmEmailResult.IsSuccess)
        {
            return confirmEmailResult;
        }

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
