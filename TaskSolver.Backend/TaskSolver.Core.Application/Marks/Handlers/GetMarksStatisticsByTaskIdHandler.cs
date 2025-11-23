using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Marks.DTOs;
using TaskSolver.Core.Application.Marks.Queries;

namespace TaskSolver.Core.Application.Marks.Handlers;

public sealed class GetMarksStatisticsByTaskIdHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarkStatisticsByTaskIdQuery, MarkStatisticsDto>
{
    public async ValueTask<MarkStatisticsDto> HandleAsync(GetMarkStatisticsByTaskIdQuery request, CancellationToken cancellationToken)
    {
        return await unitOfWork.Marks.GetStatisticsByTaskIdAsync(request.TaskId, cancellationToken);
    }
}
