using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Users.Events;

public sealed record EmailConfirmedEvent(
    Guid UserId,
    string Email)
    : DomainEvent;