using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingLanguages.DTOs;
using TaskSolver.Core.Application.ProgrammingLanguages.Queries;
using TaskSolver.Core.Domain.ProgrammingLanguages;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Handlers;

public sealed class GetAllProgrammingLanguagesHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetAllProgrammingLanguagesQuery, IReadOnlyList<ProgrammingLanguageDto>>
{
    public async ValueTask<IReadOnlyList<ProgrammingLanguageDto>> HandleAsync(GetAllProgrammingLanguagesQuery request, CancellationToken cancellationToken)
    {
        var programmingLanguages = await unitOfWork.ProgrammingLanguages.GetAllAsync(cancellationToken);

        return [.. programmingLanguages.Select(ProgrammingLanguageDto.FromEntity)];
    }
}
