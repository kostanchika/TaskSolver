using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class LoginViaPasswordHandler(
    IPasswordHasher passwordHasher,
    ITokenGenerator tokenGenerator,
    IUnitOfWork unitOfWork)
    : IRequestHandler<LoginViaPasswordCommand, Result<AuthResponseDto>>
{
    public async ValueTask<Result<AuthResponseDto>> HandleAsync(LoginViaPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Result<AuthResponseDto>.Fail("Неверный логин или пароль", ErrorCode.BadRequest);
        }

        if (user.PasswordHash is null)
        {
            return Result<AuthResponseDto>.Fail("Неверный логин или пароль", ErrorCode.BadRequest);
        }

        var isPasswordValid = passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return Result<AuthResponseDto>.Fail("Неверный логин или пароль", ErrorCode.BadRequest);
        }

        var accessToken = tokenGenerator.GenerateAccessToken(user);
        var refreshToken = tokenGenerator.GenerateRefreshToken(user);

        var authResponse = new AuthResponseDto(user.Id, accessToken, refreshToken);

        return Result<AuthResponseDto>.Ok(authResponse);
    }
}
