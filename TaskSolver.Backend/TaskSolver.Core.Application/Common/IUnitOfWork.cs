using TaskSolver.Core.Application.Users.Interfaces;

namespace TaskSolver.Core.Application.Common;

public interface IUnitOfWork
{
    IUserRepository Users { get; }

    Task CommitAsync(CancellationToken cancellationToken = default);
}
