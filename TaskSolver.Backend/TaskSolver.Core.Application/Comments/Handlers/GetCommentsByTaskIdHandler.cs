using MitMediator;
using TaskSolver.Core.Application.Comments.DTOs;
using TaskSolver.Core.Application.Comments.Queries;
using TaskSolver.Core.Application.Common;

namespace TaskSolver.Core.Application.Comments.Handlers;

public sealed class GetCommentsByTaskIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetCommentsByTaskIdQuery, IReadOnlyList<CommentDto>>
{
    public async ValueTask<IReadOnlyList<CommentDto>> HandleAsync(GetCommentsByTaskIdQuery request, CancellationToken cancellationToken)
    {
        var comments = await unitOfWork.Comments.GetByTaskIdAsync(request.TaskId, cancellationToken);

        return [.. comments.Select(c => new CommentDto(
            c.Id,
            c.UserId,
            c.TaskId,
            c.ParentId,
            c.Content,
            c.CreatedAt,
            c.UpdatedAt,
            c.IsDeleted))];
    }
}
