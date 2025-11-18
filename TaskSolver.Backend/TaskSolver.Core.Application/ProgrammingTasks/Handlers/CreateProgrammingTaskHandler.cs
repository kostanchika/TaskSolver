using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.Commands;
using TaskSolver.Core.Domain.Tasks;

namespace TaskSolver.Core.Application.ProgrammingTasks.Handlers;

public sealed class CreateProgrammingTaskHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProgrammingTaskCommand, Guid>
{
    public async ValueTask<Guid> HandleAsync(CreateProgrammingTaskCommand request, CancellationToken cancellationToken)
    {
        var programmingTask = new ProgrammingTask(
            request.Name,
            request.Description,
            request.Degree,
            request.Keywords,
            request.Input.Select(i => i.ToEntity()),
            request.Output,
            request.Hints,
            request.Examples.Select(e => e.ToEntity()),
            request.Tests.Select(t => t.ToEntity()));

        await unitOfWork.ProgrammingTasks.AddAsync(programmingTask, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return programmingTask.Id;
    }
}
