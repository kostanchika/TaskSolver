using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Matches.Events;

public sealed record TaskSolvedByPlayerEvent(
    Guid MatchId,
    Guid PlayerId,
    Guid TaskId)
    : DomainEvent;