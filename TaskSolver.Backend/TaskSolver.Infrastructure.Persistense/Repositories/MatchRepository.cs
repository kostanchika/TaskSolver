using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Domain.Matches;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

internal sealed class MatchRepository(AppDbContext context)
    : IMatchRepository
{
    public async Task AddAsync(Match match, CancellationToken cancellationToken = default)
    {
        await context.Matches.AddAsync(match, cancellationToken);
    }

    public async Task<IEnumerable<Match>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Matches
            .Include(m => m.TaskSlots)
            .Include(m => m.SolveRecords)
                .ThenInclude(m => m.Results)
            .ToListAsync(cancellationToken);
    }

    public Task<Match?> GetByActiveByPlayerIdAsync(Guid playerId, CancellationToken cancellationToken = default)
    {
        return context.Matches
            .Include(m => m.TaskSlots)
            .Include(m => m.SolveRecords)
                .ThenInclude(m => m.Results)
            .FirstOrDefaultAsync(m => 
                (m.Player1Id == playerId || m.Player2Id == playerId) &&
                !m.EndedAt.HasValue
                , cancellationToken);
    }

    public Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.Matches
            .Include(m => m.TaskSlots)
            .Include(m => m.SolveRecords)
                .ThenInclude(m => m.Results)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }
}
