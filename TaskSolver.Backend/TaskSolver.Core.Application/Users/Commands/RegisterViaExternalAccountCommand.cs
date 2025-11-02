using MitMediator;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record RegisterViaExternalAccountCommand(
    string Provider,
    string ExternalId,
    string Email)
    : IRequest<Result<AuthResponseDto>>;