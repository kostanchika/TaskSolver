namespace TaskSolver.Api.Controllers.Constructor.Responses;

public sealed record GeneratedTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = null!;
    public string Theme { get; set; } = null!;
    public string Difficulty { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<TaskStep> Steps { get; set; } = [];
    public int LastCompletedStep { get; set; } = 0;
    public Dictionary<int, StepFeedback> StepFeedbacks { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed record StepFeedback
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = null!;
    public string Hint { get; set; } = null!;
    public List<string> Suggestions { get; set; } = [];
    public DateTime ValidatedAt { get; set; }
}

public sealed record TaskStep
{
    public int Order { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Hint { get; set; } = null!;
    public StepType Type { get; set; }
    public bool IsCompleted { get; set; }
}

public enum StepType
{
    DataGeneration,
    Validation,
    Processing,
    Optimization,
    Testing,
    Documentation
}