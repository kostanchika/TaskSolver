using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Solutions;

public sealed class TestResult : Entity
{
    public string Input { get; }
    public bool IsPublic { get; }
    public string Stdout { get; }
    public string Stderr { get; }

    public bool IsSovled { get; }

    private TestResult()
    {
        Input = null!;
        Stdout = null!;
        Stderr = null!;
    }

    public TestResult(
        string input,
        bool isPublic,
        string stdout,
        string stderr,
        bool isSovled)
    {
        Input = input;
        IsPublic = isPublic;
        Stdout = stdout;
        Stderr = stderr;
        IsSovled = isSovled;
    }
}
