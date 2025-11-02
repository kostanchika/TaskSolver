using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Users.Events;

public sealed record ExternalAccountLinkedEvent(
    Guid UserId,
    ExternalLogin ExternalLogin)
    : DomainEvent;