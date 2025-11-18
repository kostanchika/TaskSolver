using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.ProgrammingTasks.Queries;

namespace TaskSolver.Core.Application.ProgrammingTasks.Handlers;

public sealed class GetProgrammingTasksHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetProgrammingTasksQuery, IReadOnlyList<ProgrammingTaskDto>>
{
    public async ValueTask<IReadOnlyList<ProgrammingTaskDto>> HandleAsync(GetProgrammingTasksQuery request, CancellationToken cancellationToken)
    {
        var programmingTasks = await unitOfWork.ProgrammingTasks.GetAllAsync(cancellationToken);

        return [.. programmingTasks.Select(ProgrammingTaskDto.FromEntity)];
    }
}
