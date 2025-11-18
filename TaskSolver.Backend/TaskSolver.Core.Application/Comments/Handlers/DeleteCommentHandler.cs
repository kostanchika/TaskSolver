using MitMediator;
using TaskSolver.Core.Application.Comments.Commands;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Comments.Handlers;

public sealed class DeleteCommentHandler(
IUnitOfWork unitOfWork)
: IRequestHandler<DeleteCommentCommand, Result>
{
    public async ValueTask<Result> HandleAsync(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await unitOfWork.Comments.GetByIdAsync(request.CommentId, cancellationToken);
        if (comment is null)
        {
            return Result.Fail("Комментарий не найден", ErrorCode.NotFound);
        }

        if (comment.UserId != request.UserId)
        {
            return Result.Fail("Вы не являетесь владельцем комментария", ErrorCode.Forbidden);
        }

        var isParent = await unitOfWork.Comments.IsParentAsync(request.CommentId, cancellationToken);
        if (!isParent)
        {
            await unitOfWork.Comments.RemoveAsync(comment, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            await TryDeleteEmptyParentAsync(comment.ParentId, cancellationToken);

            return Result.Ok();
        }

        if (comment.IsDeleted)
        {
            return Result.Fail("Комментарий уже удалён", ErrorCode.Conflict);
        }

        comment.Delete();
        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }

    private async Task TryDeleteEmptyParentAsync(Guid? parentId, CancellationToken cancellationToken)
    {
        while (parentId.HasValue)
        {
            var parent = await unitOfWork.Comments.GetByIdAsync(parentId.Value, cancellationToken);
            if (parent is null || await unitOfWork.Comments.IsParentAsync(parent.Id, cancellationToken) || !parent.IsDeleted)
            {
                break;
            }

            await unitOfWork.Comments.RemoveAsync(parent, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            parentId = parent.ParentId;
        }
    }
}