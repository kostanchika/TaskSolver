using TaskSolver.Core.Domain.Statistics;

namespace TaskSolver.Core.Application.Statistics.DTOs;

public sealed record StatisticsDto(
    Guid UserId,
    int Rating,
    int TotalSolutions,
    int GoodSolutions,
    int Percentile,
    IEnumerable<TaskRatingHistory> History)
{
    public static StatisticsDto FromEntity(UserStatistics statistics, int percentile)
        => new(
            statistics.User.Id,
            statistics.Rating,
            statistics.TotalSolutions,
            statistics.GoodSolutions,
            percentile,
            statistics.TaskHistory);
}