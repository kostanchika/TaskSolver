namespace TaskSolver.Core.Application.Consulting.Models;

public sealed record ConsultMessage(
    Guid TaskId,
    string Answer)
{
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
}