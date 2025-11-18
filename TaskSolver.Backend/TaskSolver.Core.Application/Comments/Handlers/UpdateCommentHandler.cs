using MitMediator;
using TaskSolver.Core.Application.Comments.Commands;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Comments.Handlers;

public sealed class UpdateCommentHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateCommentCommand, Result>
{
    public async ValueTask<Result> HandleAsync(UpdateCommentCommand request, CancellationToken cancellationToken)
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

        comment.Update(request.Content);

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
