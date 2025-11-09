using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Commands;

public sealed record DeleteProgrammingLanguageCommand(
    Guid Id)
    : IRequest<Result>;