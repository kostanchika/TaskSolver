using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.Comments;

public sealed class Comment : AggregateRoot
{
    public Guid? UserId { get; }
    public Guid TaskId { get; }

    public Guid? ParentId { get; }
    public string Content { get; private set; }
    public bool IsDeleted { get; private set; }

    public DateTime CreatedAt { get; }
    public DateTime? UpdatedAt { get; private set; }

    private Comment()
    {
        Content = null!;
    }

    public Comment(Guid userId, Guid taskId, Guid? parentId, string content)
    {
        ArgumentNullException.ThrowIfNull(content);

        UserId = userId;
        TaskId = taskId;
        ParentId = parentId;
        Content = content;

        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = null;
    }

    public void Update(string content)
    {
        ArgumentNullException.ThrowIfNull(content);

        Content = content;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        Content = "DELETED";
        UpdatedAt = DateTime.UtcNow;
    }
}
