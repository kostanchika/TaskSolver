using MitMediator;
using TaskSolver.Core.Application.Common.Models;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Commands;

public sealed record UpdateProgrammingLanguageCommand(
    Guid Id,
    string Name,
    string Version,
    string? Extra,
    UploadedFile? Icon)
    : IRequest<Result>;