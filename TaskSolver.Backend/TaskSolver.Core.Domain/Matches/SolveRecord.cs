using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Domain.Matches;

public sealed class SolveRecord : Entity
{
    public Guid UserId { get; }
    public Guid TaskId { get; }
    public DateTime SolvedAt { get; }
    public bool IsCompleted { get; }

    public string Code { get; }
    public List<TestResult> Results { get; set; }

    private SolveRecord()
    {
        Code = null!;
        Results = null!;
    }

    internal SolveRecord(
        Guid userId,
        Guid taskId,
        bool isCompleted,
        string code,
        IEnumerable<TestResult> results)
    {
        UserId = userId;
        TaskId = taskId;
        SolvedAt = DateTime.UtcNow;
        IsCompleted = isCompleted;
        Code = code;
        Results = [.. results];
    }
}
