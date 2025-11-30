using MitMediator;
using TaskSolver.Core.Application.Comments.Commands;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users.Constants;

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
            var user = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
            if (user is null || user.Role != UserRoles.Administrator)
            {
                return Result.Fail("Вы не являетесь владельцем комментария", ErrorCode.Forbidden);
            }
        }

        if (comment.Content != request.Content)
        {
            comment.Update(request.Content);

            await unitOfWork.CommitAsync(cancellationToken);
        }

        return Result.Ok();
    }
}
