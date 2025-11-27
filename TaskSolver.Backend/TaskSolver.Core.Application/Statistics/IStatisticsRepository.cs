using TaskSolver.Core.Domain.Statistics;

namespace TaskSolver.Core.Application.Statistics;

public interface IStatisticsRepository
{
    Task<IEnumerable<UserStatistics>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UserStatistics?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(UserStatistics statistics, CancellationToken cancellationToken = default);
}
