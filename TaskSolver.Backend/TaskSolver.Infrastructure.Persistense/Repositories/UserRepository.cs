using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Users;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

internal sealed class UserRepository(AppDbContext context) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Users
            .Include(u => u.ExternalLogins)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return context.Users
            .Include(u => u.ExternalLogins)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return context.Users
            .Include(u => u.ExternalLogins)
            .AnyAsync(u => u.Email == email, cancellationToken);
    }

    public Task<User?> GetByExternalAuthAsync(string provider, string externalId, CancellationToken cancellationToken = default)
    {
        return context.Users
            .Include(u => u.ExternalLogins)
            .FirstOrDefaultAsync(
                u => u.ExternalLogins.Any(l => l.Provider == provider && l.ExternalId == externalId),
                cancellationToken);
    }

    public Task<bool> ExistsByExternalAuthAsync(string provider, string externalId, CancellationToken cancellationToken = default)
    {
        return context.Users
            .Include(u => u.ExternalLogins)
            .AnyAsync(
                u => u.ExternalLogins.Any(l => l.Provider == provider && l.ExternalId == externalId),
                cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await context.Users.AddAsync(user, cancellationToken);
    }
}
