using TaskSolver.Api.Extensions;
using TaskSolver.Core.Application.ProgrammingLanguages.Commands;

namespace TaskSolver.Api.Controllers.ProgrammuingLanguages.Requests;

public sealed record CreateProgrammingLanguageRequest(
    string Name,
    string Version,
    string? Extra,
    IFormFile Icon,
    string FileExtension,
    string Interpretor)
{
    public CreateProgrammingLanguageCommand ToCommand()
        => new(Name, Version, Extra, Icon.ToUploadedFile(), FileExtension, Interpretor);
}
