using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Domain.Solutions;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class SolutionRepository(AppDbContext context)
    : ISolutionRepository
{
    public async Task<IEnumerable<Solution>> GetByTaskIdAndUserIdAsync(Guid taskId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.Solutions
            .Include(s => s.Results)
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Solution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Solutions
            .Include(s => s.Results)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task AddAsync(Solution solution, CancellationToken cancellationToken = default)
    {
        await context.Solutions.AddAsync(solution, cancellationToken);
    }
}
