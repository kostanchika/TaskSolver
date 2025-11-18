using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Tasks.Interfaces;
using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class ProgrammingTaskRepository(AppDbContext context) 
    : IProgrammingTaskRepository
{
    public async Task AddAsync(ProgrammingTask programmingTask, CancellationToken cancellationToken = default)
    {
        await context.ProgrammingTasks.AddAsync(programmingTask, cancellationToken);
    }

    public Task<bool> ExistsByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.ProgrammingTasks.AnyAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<ProgrammingTask>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.ProgrammingTasks
            .Include(t => t.Input)
            .Include(t => t.Examples)
            .Include(t => t.Tests)
            .ToListAsync(cancellationToken);
    }

    public Task<ProgrammingTask?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.ProgrammingTasks
            .Include(t => t.Input)
            .Include(t => t.Examples)
            .Include(t => t.Tests)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public Task RemoveAsync(ProgrammingTask programmingTask, CancellationToken cancellationToken = default)
    {
        context.ProgrammingTasks.Remove(programmingTask);

        return Task.CompletedTask;
    }
}
