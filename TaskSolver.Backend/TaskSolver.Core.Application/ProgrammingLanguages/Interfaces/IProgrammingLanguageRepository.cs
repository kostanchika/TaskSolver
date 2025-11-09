using TaskSolver.Core.Domain.ProgrammingLanguages;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Interfaces;

public interface IProgrammingLanguageRepository
{
    Task<IReadOnlyList<ProgrammingLanguage>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ProgrammingLanguage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(ProgrammingLanguage programmingLanguage, CancellationToken cancellationToken = default);
    Task RemoveAsync(ProgrammingLanguage programmingLanguage, CancellationToken cancellationToken = default);
}
