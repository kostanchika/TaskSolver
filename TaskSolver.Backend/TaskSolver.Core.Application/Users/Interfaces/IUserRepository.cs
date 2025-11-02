using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Application.Users.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByExternalAuthAsync(
        string provider,
        string externalId,
        CancellationToken cancellationToken = default);
    Task<bool> ExistsByExternalAuthAsync(
        string provider,
        string externalId,
        CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
