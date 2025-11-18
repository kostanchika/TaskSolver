using TaskSolver.Core.Domain.Comments;

namespace TaskSolver.Core.Application.Comments.Interfaces;

public interface ICommentRepository
{
    Task<IReadOnlyList<Comment>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<bool> IsParentAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Comment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Comment comment, CancellationToken cancellationToken = default);
    Task RemoveAsync(Comment comment, CancellationToken cancellationToken = default);
}
