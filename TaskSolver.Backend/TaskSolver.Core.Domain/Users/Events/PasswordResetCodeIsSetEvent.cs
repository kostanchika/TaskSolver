using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Users.Events;

public sealed record PasswordResetCodeIsSetEvent(
    Guid UserId,
    string Email,
    string Code)
    : DomainEvent;