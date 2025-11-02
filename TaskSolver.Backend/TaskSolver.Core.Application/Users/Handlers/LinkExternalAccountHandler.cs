using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class LinkExternalAccountHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<LinkExternalAccountCommand, Result>
{
    public async ValueTask<Result> HandleAsync(LinkExternalAccountCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var externalLogin = new ExternalLogin(
            request.Provider,
            request.ExternalId,
            request.Email);

        user.LinkExternalAccount(externalLogin);

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
