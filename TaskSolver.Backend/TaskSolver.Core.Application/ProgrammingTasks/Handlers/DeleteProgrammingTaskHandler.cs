using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingTasks.Handlers;

public sealed class DeleteProgrammingTaskHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProgrammingTaskCommand, Result>
{
    public async ValueTask<Result> HandleAsync(DeleteProgrammingTaskCommand request, CancellationToken cancellationToken)
    {
        var programmingTask = await unitOfWork.ProgrammingTasks.GetByIdAsync(request.Id, cancellationToken);
        if (programmingTask is null)
        {
            return Result.Fail("Задача не найдена", ErrorCode.NotFound);
        }

        await unitOfWork.ProgrammingTasks.RemoveAsync(programmingTask, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
