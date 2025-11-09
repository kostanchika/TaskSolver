using TaskSolver.Core.Domain.ProgrammingLanguages;

namespace TaskSolver.Core.Application.ProgrammingLanguages.DTOs;

public sealed record ProgrammingLanguageDto(
    Guid Id,
    string Name,
    string Version,
    string? Extra,
    string IconUrl)
{
    public static ProgrammingLanguageDto FromEntity(ProgrammingLanguage programmingLanguage)
        => new(
            programmingLanguage.Id,
            programmingLanguage.Name,
            programmingLanguage.Version,
            programmingLanguage.Extra,
            programmingLanguage.IconUrl);
}
