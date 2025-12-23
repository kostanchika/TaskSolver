using TaskSolver.Core.Domain.Matches;

namespace TaskSolver.Core.Application.Matches.Interfaces;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Match?> GetByActiveByPlayerIdAsync(Guid playerId, CancellationToken cancellationToken = default);
    Task AddAsync(Match match, CancellationToken cancellationToken = default);
}
