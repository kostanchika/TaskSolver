using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class LoginViaExternalAccountHandler(
    IUnitOfWork unitOfWork,
    ITokenGenerator tokenGenerator)
    : IRequestHandler<LoginViaExternalAccountCommand, Result<AuthResponseDto>>
{
    public async ValueTask<Result<AuthResponseDto>> HandleAsync(LoginViaExternalAccountCommand request, CancellationToken cancellationToken)
    {

        var user = await unitOfWork.Users.GetByExternalAuthAsync(
            request.Provider,
            request.ExternalId,
            cancellationToken);
        if (user is null)
        {
            return Result<AuthResponseDto>.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var accessToken = tokenGenerator.GenerateAccessToken(user);
        var refreshToken = tokenGenerator.GenerateRefreshToken(user);

        var authResponseDto = new AuthResponseDto(
            user.Id,
            accessToken,
            refreshToken);

        return Result<AuthResponseDto>.Ok(authResponseDto);
    }
}
