using Microsoft.VisualBasic;
using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Statistics.DTOs;
using TaskSolver.Core.Application.Statistics.Queries;

namespace TaskSolver.Core.Application.Statistics.Handlers;

public sealed class GetLeaderboardHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetLeaderboardQuery, IEnumerable<StatisticsDto>>
{
    public async ValueTask<IEnumerable<StatisticsDto>> HandleAsync(GetLeaderboardQuery request, CancellationToken cancellationToken)
    {
        var allStatistics = await unitOfWork.UserStatistics.GetAllAsync(cancellationToken);

        var ratings = allStatistics
            .Select(s => s.Rating)
            .OrderBy(r => r)
            .ToList();

        var ratingsCount = ratings.Count;

        var dtos = allStatistics.Select(s =>
            StatisticsDto.FromEntity(
                s,
                (int)((double)(ratings.IndexOf(s.Rating) + 1) / ratingsCount * 100)));

        return dtos;
    }
}
