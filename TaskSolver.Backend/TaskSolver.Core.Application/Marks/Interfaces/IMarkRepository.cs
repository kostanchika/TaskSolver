using TaskSolver.Core.Application.Marks.DTOs;
using TaskSolver.Core.Domain.Marks;

namespace TaskSolver.Core.Application.Marks.Interfaces;

public interface IMarkRepository
{
    Task<IReadOnlyList<Mark>> GetAllByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<MarkStatisticsDto> GetStatisticsByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<Mark?> GetByUserIdAndTaskIdAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);
    Task AddAsync(Mark mark, CancellationToken cancellationToken = default);
    Task RemoveAsync(Mark mark, CancellationToken cancellationToken = default);
}
