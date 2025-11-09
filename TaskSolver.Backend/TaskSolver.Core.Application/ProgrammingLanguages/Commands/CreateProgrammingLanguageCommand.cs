using MitMediator;
using TaskSolver.Core.Application.Common.Models;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Commands;

public sealed record CreateProgrammingLanguageCommand(
    string Name,
    string Version,
    string? Extra,
    UploadedFile Icon)
    : IRequest<Guid>;