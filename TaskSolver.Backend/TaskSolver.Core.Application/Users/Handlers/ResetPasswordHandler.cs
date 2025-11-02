using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class ResetPasswordHandler(
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher)
    : IRequestHandler<ResetPasswordCommand, Result>
{
    public async ValueTask<Result> HandleAsync(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var passwordHash = passwordHasher.HashPassword(request.Password);

        var passwordResetResult = user.ResetPassword(request.Code, passwordHash);
        if (!passwordResetResult.IsSuccess)
        {
            return passwordResetResult;
        }

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
