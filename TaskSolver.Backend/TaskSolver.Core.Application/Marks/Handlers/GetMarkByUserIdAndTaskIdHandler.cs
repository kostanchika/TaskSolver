using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Marks.DTOs;
using TaskSolver.Core.Application.Marks.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Marks.Handlers;

public sealed class GetMarkByUserIdAndTaskIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarkByUserIdAndTaskIdQuery, Result<MarkDto>>
{
    public async ValueTask<Result<MarkDto>> HandleAsync(GetMarkByUserIdAndTaskIdQuery request, CancellationToken cancellationToken)
    {
        var mark = await unitOfWork.Marks.GetByUserIdAndTaskIdAsync(
            request.UserId,
            request.TaskId,
            cancellationToken);
        if (mark is null)
        {
            return Result<MarkDto>.Fail("Оценка не найдена", ErrorCode.NotFound);
        }

        return Result.Ok(MarkDto.FromEntity(mark));
    }
}
