using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.ProgrammingTasks.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingTasks.Handlers;

public sealed class GetProgrammingTasksHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetProgrammingTasksQuery, PagedResult<ProgrammingTaskWithMarkDto>>
{
    public async ValueTask<PagedResult<ProgrammingTaskWithMarkDto>> HandleAsync(GetProgrammingTasksQuery request, CancellationToken cancellationToken)
    {
        return await unitOfWork.ProgrammingTasks.GetAllAsync(
            request.Name,
            request.Keywords,
            request.Sigil,
            request.MarkFrom,
            request.MarkTo,
            request.Page,
            request.PageSize,
            request.UserId,
            cancellationToken);
    }
}
