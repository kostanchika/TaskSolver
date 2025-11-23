using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Marks.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Marks;

namespace TaskSolver.Core.Application.Marks.Handlers;

public sealed class UpsertMarkHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpsertMarkCommand, Guid>
{
    public async ValueTask<Guid> HandleAsync(UpsertMarkCommand request, CancellationToken cancellationToken)
    {
        var mark = await unitOfWork.Marks.GetByUserIdAndTaskIdAsync(
            request.UserId,
            request.TaskId,
            cancellationToken);

        if (mark is not null)
        {
            mark.Value = request.Value;
        }
        else
        {
            mark = new Mark(
                request.UserId,
                request.TaskId,
                request.Value);

            await unitOfWork.Marks.AddAsync(mark, cancellationToken);
        }

        await unitOfWork.CommitAsync(cancellationToken);

        return mark.Id;
    }
}
