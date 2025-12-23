using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Matches.DTOs;
using TaskSolver.Core.Application.Matches.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Handlers;

public sealed class GetMatchByIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetMatchByIdQuery, Result<MatchDto>>
{
    public async ValueTask<Result<MatchDto>> HandleAsync(GetMatchByIdQuery request, CancellationToken cancellationToken)
    {
        var match = await unitOfWork.Matches.GetByIdAsync(request.MatchId, cancellationToken);
        if (match is null)
        {
            return Result<MatchDto>.Fail("Матч не найден", ErrorCode.NotFound);
        }

        return Result.Ok(MatchDto.FromEntity(match));
    }
}
