using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Users.Events;

public sealed record UserCreatedEvent(
    Guid Id,
    string Email)
    : DomainEvent;