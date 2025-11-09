using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.ProgrammingLanguages.DTOs;
using TaskSolver.Core.Application.ProgrammingLanguages.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingLanguages.Handlers;

public sealed class GetProgrammingLanguageByIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetProgrammingLanguageByIdQuery, Result<ProgrammingLanguageDto>>
{
    public async ValueTask<Result<ProgrammingLanguageDto>> HandleAsync(GetProgrammingLanguageByIdQuery request, CancellationToken cancellationToken)
    {
        var programmingLanguage = await unitOfWork.ProgrammingLanguages.GetByIdAsync(request.Id, cancellationToken);
        if (programmingLanguage is null)
        {
            return Result<ProgrammingLanguageDto>.Fail("Язык программирования не найден", ErrorCode.NotFound);
        }

        return Result.Ok(ProgrammingLanguageDto.FromEntity(programmingLanguage));
    }
}
