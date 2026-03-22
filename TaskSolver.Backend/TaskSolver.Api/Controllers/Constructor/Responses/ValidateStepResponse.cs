namespace TaskSolver.Api.Controllers.Constructor.Responses;

public sealed record ValidateStepResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = null!;
    public string Hint { get; set; } = null!;
    public List<string> Suggestions { get; set; } = new();
    public int CurrentStep { get; set; }
    public int TotalSteps { get; set; }
    public bool IsStepCompleted { get; set; }
    public bool IsTaskCompleted { get; set; }
    public string NextStepDescription { get; set; } = null!;
    public StepFeedback StepFeedback { get; set; } = null!;
}
