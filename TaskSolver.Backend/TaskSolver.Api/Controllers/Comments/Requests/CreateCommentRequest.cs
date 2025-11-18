using TaskSolver.Core.Application.Comments.Commands;

namespace TaskSolver.Api.Controllers.Comments.Requests;

public sealed record CreateCommentRequest(
    Guid? ParentId,
    string Content)
{
    public CreateCommentCommand ToCommand(Guid userId, Guid taskId)
        => new(userId, taskId, ParentId, Content);
}
