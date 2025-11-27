using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Statistics;
using TaskSolver.Core.Domain.Statistics;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class StatisticsRepository(AppDbContext context)
    : IStatisticsRepository
{
    public async Task AddAsync(UserStatistics statistics, CancellationToken cancellationToken = default)
    {
        await context.UserStatistics.AddAsync(statistics, cancellationToken);
    }

    public async Task<IEnumerable<UserStatistics>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.UserStatistics
            .AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.TaskHistory)
            .ToListAsync(cancellationToken);
    }

    public Task<UserStatistics?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return context.UserStatistics
            .Include(s => s.User)
            .Include(s => s.TaskHistory)
            .FirstOrDefaultAsync(s => s.User.Id == userId);
    }
}
