using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Statistics;

public sealed class TaskRatingHistory : Entity
{
    public Guid TaskId { get; }
    public int Difference { get; }
    public DateTime CreatedAt { get; }

    private TaskRatingHistory() { }

    internal TaskRatingHistory(Guid taskId, int difference)
    {
        TaskId = taskId;
        Difference = difference;

        CreatedAt = DateTime.UtcNow;
    }
}
