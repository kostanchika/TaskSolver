using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Users.Events;

public sealed record EmailChangedEvent(
    Guid UserId,
    string OldEmail,
    string NewEmail)
    : DomainEvent;