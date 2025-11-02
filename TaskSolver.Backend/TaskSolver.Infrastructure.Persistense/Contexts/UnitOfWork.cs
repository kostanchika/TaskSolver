using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Infrastructure.Persistense.Repositories;

namespace TaskSolver.Infrastructure.Persistense.Contexts;

public sealed class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IUserRepository _users = null!;

    public IUserRepository Users => _users ??= new UserRepository(context);

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
        // TODO EDD
    }
}
