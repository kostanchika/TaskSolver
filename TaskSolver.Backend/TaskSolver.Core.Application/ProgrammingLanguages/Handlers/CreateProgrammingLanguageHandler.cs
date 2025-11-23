using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.ProgrammingLanguages.Commands;
using TaskSolver.Core.Domain.ProgrammingLanguages;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Handlers;

public sealed class CreateProgrammingLanguageHandler(
    IUnitOfWork unitOfWork,
    IFileStorage fileStorage)
    : IRequestHandler<CreateProgrammingLanguageCommand, Guid>
{
    public async ValueTask<Guid> HandleAsync(CreateProgrammingLanguageCommand request, CancellationToken cancellationToken)
    {
        var iconUrl = await fileStorage.SaveAsync(request.Icon, "icons", true, cancellationToken);

        var programmingLanguage = new ProgrammingLanguage(
            request.Name,
            request.Version,
            request.Extra,
            iconUrl,
            request.FileExtension,
            request.Interpretor);

        await unitOfWork.ProgrammingLanguages.AddAsync(programmingLanguage, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return programmingLanguage.Id;
    }
}
