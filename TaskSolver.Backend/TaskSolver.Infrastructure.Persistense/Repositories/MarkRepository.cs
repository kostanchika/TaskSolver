using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Marks.DTOs;
using TaskSolver.Core.Application.Marks.Interfaces;
using TaskSolver.Core.Domain.Marks;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class MarkRepository(AppDbContext context)
    : IMarkRepository
{
    public async Task AddAsync(Mark mark, CancellationToken cancellationToken = default)
    {
        await context.Marks.AddAsync(mark, cancellationToken);
    }

    public async Task<IReadOnlyList<Mark>> GetAllByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        return await context.Marks.Where(m => m.TaskId == taskId)
            .ToListAsync(cancellationToken);
    }

    public Task<Mark?> GetByUserIdAndTaskIdAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        return context.Marks.FirstOrDefaultAsync(
                m => m.UserId == userId && m.TaskId == taskId, cancellationToken);
    }

    public async Task<MarkStatisticsDto> GetStatisticsByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var stats = await context.Marks
            .Where(r => r.TaskId == taskId)
            .GroupBy(r => 1)
            .Select(g => new MarkStatisticsDto(
                g.Sum(x => x.Value),
                g.Count()
            ))
            .FirstOrDefaultAsync(cancellationToken)
            ?? new MarkStatisticsDto(0, 0);

        return stats;
    }

    public Task RemoveAsync(Mark mark, CancellationToken cancellationToken = default)
    {
        context.Marks.Remove(mark);

        return Task.CompletedTask;
    }
}
