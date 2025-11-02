using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class RequestResetPasswordHandler(
    ICodeGenerator codeGenerator,
    IEmailSender emailSender,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RequestResetPasswordCommand, Result>
{
    public async ValueTask<Result> HandleAsync(RequestResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var passwordResetCode = codeGenerator.GenerateCode();

        var setPasswordResetResult = user.SetPasswordResetCode(passwordResetCode.Code, passwordResetCode.Expiry);
        if (!setPasswordResetResult.IsSuccess)
        {
            return setPasswordResetResult;
        }

        await unitOfWork.CommitAsync(cancellationToken);

        await emailSender.SendResetPasswordEmailAsync(user, cancellationToken);

        return Result.Ok();
    }
}
