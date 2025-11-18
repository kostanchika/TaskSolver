using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.ProgrammingTasks;

public sealed class TaskTest : Entity
{
    public string Input { get; }
    public string Output { get; }
    public bool IsPublic { get; }

    private TaskTest()
    {
        Input = null!;
        Output = null!;
    }

    public TaskTest(string input, string output, bool isPublic)
    {
        ArgumentNullException.ThrowIfNull(input);
        ArgumentNullException.ThrowIfNull(output);

        Input = input;
        Output = output;
        IsPublic = isPublic;
    }
}
