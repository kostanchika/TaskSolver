using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Solutions.DTOs;
using TaskSolver.Core.Application.Solutions.Queries;

namespace TaskSolver.Core.Application.Solutions.Handlers;

public sealed class GetUserSolutionsHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetUserSolutionsQuery, IEnumerable<SolutionDto>>
{
    public async ValueTask<IEnumerable<SolutionDto>> HandleAsync(GetUserSolutionsQuery request, CancellationToken cancellationToken)
    {
        var solutions = await unitOfWork.Solutions.GetByTaskIdAndUserIdAsync(
            request.TaskId,
            request.UserId,
            cancellationToken);

        return [.. solutions.Select(SolutionDto.FromEntity)];
    }
}
