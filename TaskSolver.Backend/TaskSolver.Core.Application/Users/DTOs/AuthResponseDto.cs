namespace TaskSolver.Core.Application.Users.DTOs;

public sealed record AuthResponseDto(
    Guid UserId,
    string AccessToken,
    string RefreshToken
);