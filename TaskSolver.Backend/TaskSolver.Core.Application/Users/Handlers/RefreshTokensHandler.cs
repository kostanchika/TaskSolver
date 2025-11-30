using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class RefreshTokensHandler(
    IUnitOfWork unitOfWork,
    ITokenGenerator tokenGenerator)
    : IRequestHandler<RefreshTokensCommand, Result<AuthResponseDto>>
{
    public async ValueTask<Result<AuthResponseDto>> HandleAsync(RefreshTokensCommand request, CancellationToken cancellationToken)
    {
        var userIdResult = tokenGenerator.GetUserIdFromRefreshToken(request.RefreshToken);
        if (!userIdResult.IsSuccess)
        {
            return Result<AuthResponseDto>.Fail(
                userIdResult.Error.Message, userIdResult.Error.Code);
        }

        var user = await unitOfWork.Users.GetByIdAsync(userIdResult.Value, cancellationToken);
        if (user is null)
        {
            return Result<AuthResponseDto>.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var accessToken = tokenGenerator.GenerateAccessToken(user);
        var refreshToken = tokenGenerator.GenerateRefreshToken(user);

        var authRespinseDto = new AuthResponseDto(
            user.Id,
            accessToken,
            refreshToken,
            user.Role);

        return Result.Ok(authRespinseDto);
    }
}
