using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.Tasks.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Tasks.Enums;
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

    public async Task<PagedResult<ProgrammingTaskWithMarkDto>> GetAllAsync(string? name, string? keywords, Sigil? sigil, int? markForm, int? markTo, int? page, int? pageSize, Guid? userId, CancellationToken cancellationToken = default)
    {
        var query = context.ProgrammingTasks
            .AsSplitQuery()
            .Include(t => t.Input)
            .Include(t => t.Examples)
            .Include(t => t.Tests)
            .AsNoTracking();

        if (name is not null)
        {
            query = query.Where(t => EF.Functions.ILike(t.Name, $"%{name}%"));
        }

        if (keywords is not null)
        {
            query = query.Where(t => t.Keywords.Any(k => EF.Functions.ILike(k, $"%{keywords}%")));
        }

        if (sigil.HasValue)
        {
            query = query.Where(t => t.Degree == sigil.Value);
        }

        if (markForm.HasValue || markTo.HasValue)
        {
            query = query.Where(t =>
                context.Marks
                    .Where(m => m.TaskId == t.Id)
                    .Average(m => (double?)m.Value) >= (markForm ?? double.MinValue)
                &&
                context.Marks
                    .Where(m => m.TaskId == t.Id)
                    .Average(m => (double?)m.Value) <= (markTo ?? double.MaxValue)
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        if (page.HasValue && pageSize.HasValue)
        {
            query = query
                .OrderBy(t => t.Id)
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value);
        }

        var entities = await query.ToListAsync(cancellationToken);

        var items = entities
            .Select(t => new ProgrammingTaskWithMarkDto(
                t.Id,
                t.Name,
                t.Description,
                t.Degree,
                t.Keywords,
                t.Input.Select(TaskInputDto.FromEntity),
                t.Output,
                t.Hints,
                t.Examples.Select(TaskExampleDto.FromEntity),
                t.Tests.Select(TaskTestDto.FromEntity),
                context.Marks.Where(m => m.TaskId == t.Id).Average(m => (double?)m.Value) ?? 0,
                context.Solutions.Any(s => s.UserId == userId && s.TaskId == t.Id && s.Results.All(r => r.IsSovled))
            ));
        
        return new PagedResult<ProgrammingTaskWithMarkDto>(items, totalCount);
    }

    public async Task<IReadOnlyList<ProgrammingTask>> GetAllBySigilAsync(Sigil sigil, CancellationToken cancellationToken = default)
    {
        return await context.ProgrammingTasks
            .AsSplitQuery()
            .Include(t => t.Input)
            .Include(t => t.Examples)
            .Include(t => t.Tests)
            .Where(t => t.Degree == sigil || t.Degree - 1 == sigil || t.Degree + 1 == sigil)
            .ToListAsync(cancellationToken);
    }

    public Task<ProgrammingTask?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.ProgrammingTasks
            .AsSplitQuery()
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
