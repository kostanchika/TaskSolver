using MitMediator;
using TaskSolver.Core.Application.ProgrammingLanguages.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.ProgrammingLanguages;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Queries;

public sealed record GetProgrammingLanguageByIdQuery(
    Guid Id)
    : IRequest<Result<ProgrammingLanguageDto>>;