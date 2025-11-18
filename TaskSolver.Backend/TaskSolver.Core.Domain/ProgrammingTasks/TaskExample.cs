using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Tasks;

public sealed class TaskExample : Entity
{
    public string Input { get; }
    public string Output { get; }
    public string Description { get; }

    private TaskExample()
    {
        Input = null!;
        Output = null!;
        Description = null!;
    }

    public TaskExample(string input, string output, string description)
    {
        ArgumentNullException.ThrowIfNull(input);
        ArgumentNullException.ThrowIfNull(output);
        ArgumentNullException.ThrowIfNull(description);

        Input = input;
        Output = output;
        Description = description;
    }
}
