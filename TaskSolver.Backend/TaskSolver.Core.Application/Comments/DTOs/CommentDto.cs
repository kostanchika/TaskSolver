namespace TaskSolver.Core.Application.Comments.DTOs;

public sealed record CommentDto(
    Guid Id,
    Guid? UserId,
    Guid TaskId,
    Guid? ParentId,
    string Content,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    bool IsDeleted);