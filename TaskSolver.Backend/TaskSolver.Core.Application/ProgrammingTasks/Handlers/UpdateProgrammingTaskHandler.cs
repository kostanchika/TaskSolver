using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingTasks.Handlers;

public sealed class UpdateProgrammingTaskHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProgrammingTaskCommand, Result>
{
    public async ValueTask<Result> HandleAsync(UpdateProgrammingTaskCommand request, CancellationToken cancellationToken)
    {
        var programmingTask = await unitOfWork.ProgrammingTasks.GetByIdAsync(request.Id, cancellationToken);
        if (programmingTask is null)
        {
            return Result.Fail("Задача не найдена", ErrorCode.NotFound);
        }

        programmingTask.Name = request.Name;
        programmingTask.Description = request.Description;
        programmingTask.Degree = request.Degree;
        programmingTask.Keywords = [.. request.Keywords];
        programmingTask.Input = [.. request.Input.Select(i => i.ToEntity())];
        programmingTask.Output = request.Output;
        programmingTask.Examples = [.. request.Examples.Select(e => e.ToEntity())];
        programmingTask.Tests = [.. request.Tests.Select(t => t.ToEntity())];

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
