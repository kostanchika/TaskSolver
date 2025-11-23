using TaskSolver.Core.Domain.Solutions;

namespace TaskSolver.Core.Application.Solutions.Interfaces;

public interface ISolutionRepository
{
    Task<IEnumerable<Solution>> GetByTaskIdAndUserIdAsync(Guid taskId, Guid userId, CancellationToken cancellationToken = default);
    Task<Solution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Solution solution, CancellationToken cancellationToken = default);
}
