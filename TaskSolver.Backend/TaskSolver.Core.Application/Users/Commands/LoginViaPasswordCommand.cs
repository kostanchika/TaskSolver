using MitMediator;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record LoginViaPasswordCommand(
    string Email,
    string Password
) : IRequest<Result<AuthResponseDto>>;