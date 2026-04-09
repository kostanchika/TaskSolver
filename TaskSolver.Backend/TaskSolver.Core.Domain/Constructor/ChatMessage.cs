using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Constructor;

public sealed class ChatMessage : Entity
{
    public Guid ChatId { get; set; }
    public string Role { get; set; }
    public string Content { get; set; }
    public string? Code { get; set; }
    public string? Language { get; set; }
    public int? StepNumber { get; set; }
    public bool? IsValid { get; set; }
    public string? Feedback { get; set; }
    public DateTime CreatedAt { get; set; }

    private ChatMessage()
    {
        Role = null!;
        Content = null!;
    }

    public ChatMessage(
        string role,
        string content,
        string? code,
        string? language,
        int? stepNumber,
        bool? isValid,
        string? feedback)
    {
        Role = role;
        Content = content;
        Code = code;
        Language = language;
        StepNumber = stepNumber;
        IsValid = isValid;
        Feedback = feedback;

        CreatedAt = DateTime.UtcNow;
    }
}
