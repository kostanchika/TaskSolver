using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.ProgrammingLanguages.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Handlers;

public sealed class UpdateProgrammingLanguageHandler(
    IUnitOfWork unitOfWork,
    IFileStorage fileStorage)
    : IRequestHandler<UpdateProgrammingLanguageCommand, Result>
{
    public async ValueTask<Result> HandleAsync(UpdateProgrammingLanguageCommand request, CancellationToken cancellationToken)
    {
        var programmingLanguage = await unitOfWork.ProgrammingLanguages.GetByIdAsync(request.Id, cancellationToken);
        if (programmingLanguage is null)
        {
            return Result.Fail("Язык программирования не найден", ErrorCode.NotFound);
        }

        var iconUrl = programmingLanguage.IconUrl;
        if (request.Icon is not null)
        {
            iconUrl = await fileStorage.SaveAsync(request.Icon, "icons", true, cancellationToken);
        }

        programmingLanguage.Name = request.Name;
        programmingLanguage.Version = request.Version;
        programmingLanguage.Extra = request.Extra;
        programmingLanguage.IconUrl = iconUrl;
        programmingLanguage.FileExtension = request.FileExtension;
        programmingLanguage.Interpretor = request.Interpretor;

        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
