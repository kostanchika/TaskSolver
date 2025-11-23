using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Marks;

public sealed class Mark : AggregateRoot
{
    public Guid UserId { get; }
    public Guid TaskId { get; }

    public int Value { get; set; }

    public DateTime CreatedAt { get; }

    private Mark() { }

    public Mark(Guid userId, Guid taskId, int value)
    {
        UserId = userId;
        TaskId = taskId;
        Value = value;

        CreatedAt = DateTime.UtcNow;
    }
}
