using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.ProgrammingTasks;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Domain.Tasks;

public sealed class ProgrammingTask : AggregateRoot
{
    public string Name { get; set; }
    public string Description { get; set; }

    public TaskDegree Degree { get; set; }
    public List<string> Keywords { get; set; }

    public List<TaskInput> Input { get; set; }
    public string Output { get; set; }
    public List<string> Hints { get; set; }
    public List<TaskExample> Examples { get; set; }
    public List<TaskTest> Tests { get; set; }

    public DateTime CreatedAt { get; }

    private ProgrammingTask()
    {
        Name = null!;
        Description = null!;
        Keywords = null!;
        Input = null!;
        Output = null!;
        Hints = null!;
        Examples = null!;
        Tests = null!;
    }

    public ProgrammingTask(
        string name,
        string description,
        TaskDegree degree,
        IEnumerable<string> keywords,
        IEnumerable<TaskInput> input,
        string output,
        IEnumerable<string> hints,
        IEnumerable<TaskExample> examples,
        IEnumerable<TaskTest> tests)
    {
        ArgumentNullException.ThrowIfNull(name);
        ArgumentNullException.ThrowIfNull(description);
        ArgumentNullException.ThrowIfNull(keywords);
        ArgumentNullException.ThrowIfNull(input);
        ArgumentNullException.ThrowIfNull(output);
        ArgumentNullException.ThrowIfNull(hints);
        ArgumentNullException.ThrowIfNull(examples);
        ArgumentNullException.ThrowIfNull(tests);

        Name = name;
        Description = description;
        Degree = degree;
        Keywords = [.. keywords];
        Input = [.. input];
        Output = output;
        Hints = [.. hints];
        Examples = [.. examples];
        Tests = [.. tests];

        CreatedAt = DateTime.UtcNow;
    }
}
