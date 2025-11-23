using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Solutions;

public sealed class Solution : AggregateRoot
{
    public Guid LanguageId { get; }
    public Guid UserId { get; }
    public Guid TaskId { get; }

    public string Code { get; }
    public List<TestResult> Results { get; set; }

    public DateTime CreatedAt { get; }
    public DateTime? CompletedAt { get; set; }

    private Solution()
    {
        Code = null!;
        Results = null!;
    }

    public Solution(
        Guid languageId,
        Guid userId,
        Guid taskId,
        string code)
    {
        LanguageId = languageId;
        UserId = userId;
        TaskId = taskId;
        Code = code;
        Results = [];
        CreatedAt = DateTime.UtcNow;
    }

    public void Complete(IEnumerable<TestResult> testResults)
    {
        Results = [.. testResults];
        CompletedAt = DateTime.UtcNow;
    }
}
