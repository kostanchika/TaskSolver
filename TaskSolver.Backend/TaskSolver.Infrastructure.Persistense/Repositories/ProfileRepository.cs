using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Profiles.Interfaces;
using TaskSolver.Core.Domain.Profiles;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class ProfileRepository(AppDbContext context)
    : IProfileRepository
{
    public Task<Profile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return context.Profiles
            .Include(p => p.User)
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.User.Id == userId, cancellationToken);
    }

    public async Task AddAsync(Profile profile, CancellationToken cancellationToken = default)
    {
        await context.Profiles.AddAsync(profile, cancellationToken);
    }
}
