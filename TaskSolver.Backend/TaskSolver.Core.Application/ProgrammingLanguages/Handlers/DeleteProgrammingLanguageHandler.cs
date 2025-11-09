using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingLanguages.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Handlers;

public sealed class DeleteProgrammingLanguageHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProgrammingLanguageCommand, Result>
{
    public async ValueTask<Result> HandleAsync(DeleteProgrammingLanguageCommand request, CancellationToken cancellationToken)
    {
        var programmingLanguage = await unitOfWork.ProgrammingLanguages.GetByIdAsync(request.Id);
        if (programmingLanguage is null)
        {
            return Result.Fail("Язык программирования не найден", ErrorCode.NotFound);
        }

        await unitOfWork.ProgrammingLanguages.RemoveAsync(programmingLanguage, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return Result.Ok();
    }
}
