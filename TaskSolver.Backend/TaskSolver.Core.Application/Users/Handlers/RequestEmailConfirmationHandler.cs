using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class RequestEmailConfirmationHandler(
    IUnitOfWork unitOfWork,
    ICodeGenerator codeGenerator,
    IEmailSender emailSender)
    : IRequestHandler<RequestEmailConfirmationCommand, Result>
{
    public async ValueTask<Result> HandleAsync(RequestEmailConfirmationCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var emailConfirmationCode = codeGenerator.GenerateCode();

        var setEmailConfirmationResult = user.SetEmailConfirmationCode(emailConfirmationCode.Code, emailConfirmationCode.Expiry);
        if (!setEmailConfirmationResult.IsSuccess)
        {
            return setEmailConfirmationResult;
        }

        await unitOfWork.CommitAsync(cancellationToken);

        await emailSender.SendConfirmationEmailAsync(user, cancellationToken);

        return Result.Ok();
    }
}
