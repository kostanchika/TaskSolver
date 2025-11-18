using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Tasks;

public sealed class TaskInput : Entity
{
    public string Name { get; }
    public string Type { get; }
    public string Constraints { get; }
    public string Description { get; }

    private TaskInput()
    {
        Name = null!;
        Type = null!;
        Constraints = null!;
        Description = null!;
    }

    public TaskInput(
        string name,
        string type,
        string constraints,
        string description)
    {
        ArgumentNullException.ThrowIfNull(name);
        ArgumentNullException.ThrowIfNull(type);
        ArgumentNullException.ThrowIfNull(constraints);
        ArgumentNullException.ThrowIfNull(description);

        Name = name;
        Type = type;
        Constraints = constraints;
        Description = description;
    }
}
