using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.ProgrammingTasks.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingTasks.Handlers;

public sealed class GetProgrammingTaskByIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetProgrammingTaskByIdQuery, Result<ProgrammingTaskDto>>
{
    public async ValueTask<Result<ProgrammingTaskDto>> HandleAsync(GetProgrammingTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var programmingTask = await unitOfWork.ProgrammingTasks.GetByIdAsync(request.Id, cancellationToken);
        if (programmingTask is null)
        {
            return Result<ProgrammingTaskDto>.Fail("Задача не найдена", ErrorCode.NotFound);
        }

        return Result.Ok(ProgrammingTaskDto.FromEntity(programmingTask));
    }
}
