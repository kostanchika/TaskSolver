using MitMediator;
using TaskSolver.Core.Application.ProgrammingLanguages.DTOs;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Queries;

public sealed record GetAllProgrammingLanguagesQuery()
    : IRequest<IReadOnlyList<ProgrammingLanguageDto>>;