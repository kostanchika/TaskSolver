using MitMediator;
using TaskSolver.Core.Application.Comments.Commands;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Comments;

namespace TaskSolver.Core.Application.Comments.Handlers;

public sealed class CreateCommentHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateCommentCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> HandleAsync(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var taskExists = await unitOfWork.ProgrammingTasks.ExistsByIdAsync(request.TaskId, cancellationToken);
        if (!taskExists)
        {
            return Result<Guid>.Fail("Задача не найдена", ErrorCode.Conflict);
        }

        var comment = new Comment(request.UserId, request.TaskId, request.ParentId, request.Content);

        await unitOfWork.Comments.AddAsync(comment, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok(comment.Id);
    }
}
