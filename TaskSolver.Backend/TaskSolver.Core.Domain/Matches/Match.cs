using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Matches.Events;
using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Domain.Matches;

public sealed class Match : AggregateRoot
{
    public Guid Player1Id { get; }
    public Guid Player2Id { get; }

    public Guid? WinnerId { get; set; }

    public List<TaskSlot> TaskSlots { get; }
    public List<SolveRecord> SolveRecords { get; }

    public DateTime StartedAt { get; }
    public DateTime EndsAt { get; }
    public DateTime? EndedAt { get; private set; }

    private Match() 
    {
        TaskSlots = null!;
        SolveRecords = null!;
    }

    public Match(
        Guid player1Id,
        Guid player2Id,
        IEnumerable<TaskSlot> taskSlots,
        DateTime endsAt
        )
    {
        ArgumentNullException.ThrowIfNull(taskSlots);

        Player1Id = player1Id;
        Player2Id = player2Id;
        TaskSlots = [.. taskSlots];
        EndsAt = endsAt;

        SolveRecords = [];
        StartedAt = DateTime.UtcNow;

        AddDomainEvent(new MatchStartedEvent(Id));
    }

    public Result AddSolution(
        Guid playerId,
        Guid taskId,
        bool isCompleted,
        string code,
        IEnumerable<TestResult> results)
    {
        if (EndedAt is not null)
        {
            return Result.Fail("Матч уже завершён", ErrorCode.Conflict);
        }

        var solveRecord = new SolveRecord(playerId, taskId, isCompleted, code, results);

        SolveRecords.Add(solveRecord);

        AddDomainEvent(new TaskSolvedByPlayerEvent(Id, playerId, taskId));

        return Result.Ok();
    }

    public Result End(Guid winnerId)
    {
        if (EndedAt is not null)
        {
            return Result.Fail("Матч уже завершён", ErrorCode.Conflict);
        }

        WinnerId = winnerId;
        EndedAt = DateTime.UtcNow;

        AddDomainEvent(new MatchEndedEvent(Id, winnerId));

        return Result.Ok();
    }
}
