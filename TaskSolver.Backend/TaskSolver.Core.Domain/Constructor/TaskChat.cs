using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Constructor;

public sealed class TaskChat : AggregateRoot
{
    public Guid UserId { get; }
    public string Title { get; set; }
    public string Theme { get; set; }
    public string Difficulty { get; }
    public string? TaskData { get; set; }
    public List<ChatMessage> Messages { get; }
    public int LastCompletedStep { get; set; }
    public DateTime CreatedAt { get; }
    public DateTime UpdatedAt { get; set; }

    public bool IsArchived { get; set; }

    private TaskChat()
    {
        Title = null!;
        Theme = null!;
        Difficulty = null!;
        TaskData = null!;
        Messages = null!;
    }

    public TaskChat(
        Guid userId,
        string title,
        string theme,
        string difficulty)
    {
        UserId = userId;
        Title = title;
        Theme = theme;
        Difficulty = difficulty;

        Messages = [];
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
