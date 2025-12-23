using TaskSolver.Core.Domain.Matches;

namespace TaskSolver.Core.Application.Matches.DTOs;

public sealed record MatchDto(
    Guid Id,
    Guid Player1Id,
    Guid Player2Id,
    Guid? WinnerId,
    IEnumerable<TaskSlot> TaskSlots,
    IEnumerable<SolveRecord> SolveRecords,
    DateTime StartedAt,
    DateTime EndsAt,
    DateTime? EndedAt)
{
    public static MatchDto FromEntity(Match match)
        => new(
            match.Id,
            match.Player1Id,
            match.Player2Id,
            match.WinnerId,
            match.TaskSlots,
            match.SolveRecords,
            match.StartedAt,
            match.EndsAt,
            match.EndedAt);
}
