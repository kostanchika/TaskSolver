using TaskSolver.Api.Extensions;
using TaskSolver.Core.Application.ProgrammingLanguages.Commands;

namespace TaskSolver.Api.Controllers.ProgrammuingLanguages.Requests;

public sealed record UpdateProgrammingLanguageRequest(
    string Name,
    string Version,
    string? Extra,
    IFormFile? Icon,
    string Interpretor,
    string FileExtension)
{
    public UpdateProgrammingLanguageCommand ToCommand(Guid id)
        => new(id, Name, Version, Extra, Icon?.ToUploadedFile(), FileExtension, Interpretor);
}

