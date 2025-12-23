using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Tasks;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.Tasks.Interfaces;

public interface IProgrammingTaskRepository
{
    Task<PagedResult<ProgrammingTaskWithMarkDto>> GetAllAsync(
        string? name,
        string? keywords,
        Sigil? sigil,
        int? markForm,
        int? markTo,
        int? page,
        int? pageSize,
        Guid? userId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProgrammingTask>> GetAllBySigilAsync(Sigil sigil, CancellationToken cancellationToken = default);
    Task<ProgrammingTask?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(ProgrammingTask programmingTask, CancellationToken cancellationToken = default);
    Task RemoveAsync(ProgrammingTask programmingTask, CancellationToken cancellationToken = default);
}
