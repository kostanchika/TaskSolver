using TaskSolver.Core.Domain.Profiles;

namespace TaskSolver.Core.Application.Profiles.Interfaces;

public interface IProfileRepository
{
    Task AddAsync(Profile profile, CancellationToken cancellationToken = default);
    Task<Profile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
