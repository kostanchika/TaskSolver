using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Solutions.Events;

public sealed record TaskSolvedEvent(
    Guid UserId,
    Guid TaskId,
    bool IsCorrect)
    : DomainEvent;