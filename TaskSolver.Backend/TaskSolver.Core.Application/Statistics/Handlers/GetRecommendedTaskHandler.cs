using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.Statistics.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.Statistics.Handlers;

public sealed class GetRecommendedTaskHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetRecommendedTaskQuery, Result<ProgrammingTaskDto>>
{
    public async ValueTask<Result<ProgrammingTaskDto>> HandleAsync(GetRecommendedTaskQuery request, CancellationToken cancellationToken)
    {
        var statistics = await unitOfWork.UserStatistics.GetByUserIdAsync(request.UserId, cancellationToken);
        if (statistics is null)
        {
            return Result<ProgrammingTaskDto>.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var sigil = Math.Floor(((double)statistics.Rating / 300));
        if (sigil > 7) sigil = 7;

        var recommendedTasks = await unitOfWork.ProgrammingTasks.GetAllBySigilAsync(
            (Sigil)sigil, cancellationToken);
        recommendedTasks = [.. recommendedTasks.Where(t =>
            !statistics.TaskHistory.Select(h => h.TaskId).Contains(t.Id))];
        if (!recommendedTasks.Any())
        {
            return Result<ProgrammingTaskDto>.Fail("Нет подходящих задач", ErrorCode.Conflict);
        }

        var recommendedTask = recommendedTasks.OrderBy(t => Guid.NewGuid()).First();

        return Result.Ok(ProgrammingTaskDto.FromEntity(recommendedTask));
    }
}
