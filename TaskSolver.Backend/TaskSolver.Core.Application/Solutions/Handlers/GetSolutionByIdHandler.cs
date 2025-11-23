using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Solutions.DTOs;
using TaskSolver.Core.Application.Solutions.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Solutions.Handlers;

public sealed class GetSolutionByIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetSolutionByIdQuery, Result<SolutionDto>>
{
    public async ValueTask<Result<SolutionDto>> HandleAsync(GetSolutionByIdQuery request, CancellationToken cancellationToken)
    {
        var solution = await unitOfWork.Solutions.GetByIdAsync(request.Id, cancellationToken);
        if (solution is null)
        {
            return Result<SolutionDto>.Fail("Решение не найдено", ErrorCode.NotFound);
        }

        return Result.Ok(SolutionDto.FromEntity(solution));
    }
}
