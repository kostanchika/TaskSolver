using MitMediator;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record LoginViaExternalAccountCommand(
    string Provider,
    string ExternalId)
    : IRequest<Result<AuthResponseDto>>;