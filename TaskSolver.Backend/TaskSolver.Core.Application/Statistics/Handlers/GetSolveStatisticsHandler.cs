using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Statistics.DTOs;
using TaskSolver.Core.Application.Statistics.Queries;

namespace TaskSolver.Core.Application.Statistics.Handlers;

public sealed class GetSolveStatisticsHandler(
    IUnitOfWork unitOfWork
) : IRequestHandler<GetSolveStatisticsQuery, SolveStatisticsDto>
{
    public async ValueTask<SolveStatisticsDto> HandleAsync(GetSolveStatisticsQuery request, CancellationToken cancellationToken)
    {
        var solutions = await unitOfWork.Solutions.GetAllAsync(cancellationToken);

        var totalSolutions = solutions.Count();

        var correctSolutions = solutions.Count(s => s.Results.All(r => r.IsSovled));

        var incorrectSolutions = solutions.Where(s => !s.Results.All(r => r.IsSovled)).ToList();
        double avgSolvedTestsInIncorrectSolution = incorrectSolutions.Any()
            ? incorrectSolutions.Average(s => s.Results.Count(r => r.IsSovled))
            : 0;

        double avgSolutionTimeSeconds = solutions
            .Where(s => s.CompletedAt.HasValue)
            .Select(s => (s.CompletedAt!.Value - s.CreatedAt).TotalSeconds)
            .DefaultIfEmpty(0)
            .Average();

        var activeUsers = solutions.Select(s => s.UserId).Distinct().Count();

        var tasksStatistics = solutions
            .GroupBy(s => s.TaskId)
            .Select(g => new TaskStatisticsDto(
                TaskId: g.Key,
                TotalSolutions: g.Count(),
                CorrectSolutions: g.Count(s => s.Results.All(r => r.IsSovled))
            ));

        return new SolveStatisticsDto(
            TotalSolutions: totalSolutions,
            CorrectSolutions: correctSolutions,
            AvgSolvedTestsInIncorrectSolution: avgSolvedTestsInIncorrectSolution,
            AvgSolutionTimeSeconds: avgSolutionTimeSeconds,
            ActiveUsers: activeUsers,
            TasksStatistics: tasksStatistics
        );
    }
}