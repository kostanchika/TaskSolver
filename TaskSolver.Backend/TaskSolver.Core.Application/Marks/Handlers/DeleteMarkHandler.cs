using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Marks.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Marks.Handlers;

public sealed class DeleteMarkHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMarkCommand, Result>
{
    public async ValueTask<Result> HandleAsync(DeleteMarkCommand request, CancellationToken cancellationToken)
    {
        var mark = await unitOfWork.Marks.GetByUserIdAndTaskIdAsync(
            request.UserId,
            request.TaskId,
            cancellationToken);
        if (mark is null)
        {
            return Result.Fail("Оценка не найдена", ErrorCode.NotFound);
        }

        await unitOfWork.Marks.RemoveAsync(mark, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
