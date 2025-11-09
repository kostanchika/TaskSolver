using TaskSolver.Core.Application.Profiles.Interfaces;
using TaskSolver.Core.Application.Users.Interfaces;

namespace TaskSolver.Core.Application.Common;

public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IProfileRepository Profiles { get; }

    Task CommitAsync(CancellationToken cancellationToken = default);
}
