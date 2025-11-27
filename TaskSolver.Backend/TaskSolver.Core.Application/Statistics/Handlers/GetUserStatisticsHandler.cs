using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Statistics.DTOs;
using TaskSolver.Core.Application.Statistics.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Statistics.Handlers;

public sealed class GetUserStatisticsHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetUserStatisticsQuery, Result<StatisticsDto>>
{
    public async ValueTask<Result<StatisticsDto>> HandleAsync(GetUserStatisticsQuery request, CancellationToken cancellationToken)
    {
        var statistics = await unitOfWork.UserStatistics.GetByUserIdAsync(
            request.UserId,
            cancellationToken);
        if (statistics is null)
        {
            return Result<StatisticsDto>.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var allStatistics = await unitOfWork.UserStatistics.GetAllAsync(cancellationToken);

        var ratings = allStatistics
            .Select(s => s.Rating)
            .OrderBy(r => r)
            .ToList();

        var userRating = statistics.Rating;

        var rank = ratings.IndexOf(userRating) + 1;

        var percentile = (double)rank / ratings.Count * 100;

        return Result.Ok(StatisticsDto.FromEntity(statistics, (int)percentile));
    }
}
