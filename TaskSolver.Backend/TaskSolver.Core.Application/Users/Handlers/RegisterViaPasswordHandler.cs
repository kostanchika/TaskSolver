using MitMediator;
using System.Net.Http.Headers;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Users.Handlers;

public sealed class RegisterViaPasswordHandler(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITokenGenerator tokenGenerator)
    : IRequestHandler<RegisterViaPasswordCommand, Result<AuthResponseDto>>
{
    public async ValueTask<Result<AuthResponseDto>> HandleAsync(RegisterViaPasswordCommand request, CancellationToken cancellationToken)
    {
        var userExists = await unitOfWork.Users.ExistsByEmailAsync(request.Email, cancellationToken);
        if (userExists)
        {
            return Result<AuthResponseDto>.Fail("Данный email уже занят", ErrorCode.Conflict);
        }

        var passwordHash = passwordHasher.HashPassword(request.Password);

        var user = User.Register(request.Email, passwordHash);

        await unitOfWork.Users.AddAsync(user, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        var accessToken = tokenGenerator.GenerateAccessToken(user);
        var refreshToken = tokenGenerator.GenerateRefreshToken(user);

        var authResponseDto = new AuthResponseDto(user.Id, accessToken, refreshToken);

        return Result<AuthResponseDto>.Ok(authResponseDto);
    }
}
