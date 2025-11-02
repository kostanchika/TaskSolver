using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record LinkExternalAccountCommand(
    Guid UserId,
    string Provider,
    string ExternalId,
    string Email)
    : IRequest<Result>;