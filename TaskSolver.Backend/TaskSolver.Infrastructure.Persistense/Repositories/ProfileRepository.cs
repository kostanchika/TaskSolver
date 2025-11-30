using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Profiles.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;
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

    public async Task<PagedResult<Profile>> GetAllAsync(string? email, string? profileName, int? page, int? pageSize, CancellationToken cancellationToken = default)
    {
        var query = context.Profiles.AsNoTracking()
            .Include(p => p.User)
                .ThenInclude(u => u.ExternalLogins)
            .Include(p => p.SocialLinks)
            .AsQueryable();

        if (email is not null)
        {
            query = query.Where(p => EF.Functions.ILike(p.User.Email, $"%{email}%"));
        }

        if (profileName is not null)
        {
            query = query.Where(p => EF.Functions.ILike(p.ProfileName, $"%{profileName}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        if (page.HasValue && pageSize.HasValue)
        {
            query = query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value);
        }

        var items = await query.ToListAsync(cancellationToken);

        return new PagedResult<Profile>(
            items,
            totalCount);
    }
}
