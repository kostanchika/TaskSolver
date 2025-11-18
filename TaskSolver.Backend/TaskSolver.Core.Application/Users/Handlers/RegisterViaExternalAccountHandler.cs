using MitMediator;
using System.Net.Http.Headers;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class RegisterViaExternalAccountHandler(
    IUnitOfWork unitOfWork,
    ITokenGenerator tokenGenerator)
    : IRequestHandler<RegisterViaExternalAccountCommand, Result<AuthResponseDto>>
{
    public async ValueTask<Result<AuthResponseDto>> HandleAsync(RegisterViaExternalAccountCommand request, CancellationToken cancellationToken)
    {
        var userExists = await unitOfWork.Users.ExistsByExternalAuthAsync(
            request.Provider,
            request.ExternalId,
            cancellationToken);
        if (userExists)
        {
            return Result<AuthResponseDto>.Fail(
                "Пользователь, зарегистрированный данным способом уже существует",
                ErrorCode.Conflict);
        }

        var externalLogin = new ExternalLogin(
            request.Provider,
            request.ExternalId,
            request.Email);

        var user = await unitOfWork.Users.GetByEmailAsync(
            request.Email,
            cancellationToken);
        if (user is not null)
        {
            user.LinkExternalAccount(externalLogin);
        }
        else
        {
            user = User.Register(externalLogin);

            await unitOfWork.Users.AddAsync(user, cancellationToken);
        }

        await unitOfWork.CommitAsync(cancellationToken);

        var accessToken = tokenGenerator.GenerateAccessToken(user);
        var refreshToken = tokenGenerator.GenerateRefreshToken(user);

        var authResponseDto = new AuthResponseDto(user.Id, accessToken, refreshToken, user.Role);

        return Result<AuthResponseDto>.Ok(authResponseDto);
    }
}
