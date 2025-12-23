using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Matches;

public sealed class TaskSlot : Entity
{
    public Guid TaskId { get; }
    public int Order { get; }

    private TaskSlot() { }

    public TaskSlot(Guid taskId, int order)
    {
        TaskId = taskId;
        Order = order;
    }
}
