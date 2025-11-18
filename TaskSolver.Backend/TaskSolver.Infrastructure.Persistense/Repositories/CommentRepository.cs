using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Comments.Interfaces;
using TaskSolver.Core.Domain.Comments;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class CommentRepository(AppDbContext context)
    : ICommentRepository
{
    public async Task AddAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        await context.Comments.AddAsync(comment, cancellationToken);
    }

    public Task<Comment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Comments.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Comment>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        return await context.Comments.Where(c => c.TaskId == taskId).ToListAsync(cancellationToken);
    }

    public Task<bool> IsParentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Comments.AnyAsync(c => c.ParentId == id, cancellationToken);
    }

    public Task RemoveAsync(Comment comment, CancellationToken cancellationToken = default)
    {
        context.Comments.Remove(comment);

        return Task.CompletedTask;
    }
}
