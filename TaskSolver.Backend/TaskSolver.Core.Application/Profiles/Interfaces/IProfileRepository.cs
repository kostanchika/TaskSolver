using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Profiles;

namespace TaskSolver.Core.Application.Profiles.Interfaces;

public interface IProfileRepository
{
    Task<PagedResult<Profile>> GetAllAsync(
        string? email,
        string? profileName,
        int? page,
        int? pageSize,
        CancellationToken cancellationToken = default);
    Task AddAsync(Profile profile, CancellationToken cancellationToken = default);
    Task<Profile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
