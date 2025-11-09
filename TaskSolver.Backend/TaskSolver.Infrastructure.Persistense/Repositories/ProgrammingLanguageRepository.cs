using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.ProgrammingLanguages.Interfaces;
using TaskSolver.Core.Domain.ProgrammingLanguages;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

public sealed class ProgrammingLanguageRepository(AppDbContext context)
    : IProgrammingLanguageRepository
{
    public async Task AddAsync(ProgrammingLanguage programmingLanguage, CancellationToken cancellationToken = default)
    {
        await context.ProgrammingLanguages.AddAsync(programmingLanguage, cancellationToken);
    }

    public async Task<IReadOnlyList<ProgrammingLanguage>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.ProgrammingLanguages.ToListAsync(cancellationToken);
    }

    public Task<ProgrammingLanguage?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.ProgrammingLanguages.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public Task RemoveAsync(ProgrammingLanguage programmingLanguage, CancellationToken cancellationToken = default)
    {
        context.ProgrammingLanguages.Remove(programmingLanguage);

        return Task.CompletedTask;
    }
}
