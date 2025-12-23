using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Matches.Events;

public sealed record MatchEndedEvent(
    Guid MatchId,
    Guid WinnerId)
    : DomainEvent;