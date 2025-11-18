using TaskSolver.Core.Application.Comments.Commands;

namespace TaskSolver.Api.Controllers.Comments.Requests;

public sealed record UpdateCommentRequest(
    string Content)
{
    public UpdateCommentCommand ToCommand(Guid commentId, Guid userId)
        => new(commentId, userId, Content);
}
