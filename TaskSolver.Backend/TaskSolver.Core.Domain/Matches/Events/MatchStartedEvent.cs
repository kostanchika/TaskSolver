using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Matches.Events;

public sealed record MatchStartedEvent(
    Guid MatchId)
    : DomainEvent;