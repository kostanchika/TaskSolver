using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Handlers;

public sealed class JoinQueueHandler(
    IUnitOfWork unitOfWork,
    IMatchmakingQueue matchmakingQueue,
    IMatchmakingNotificator matchmakingNotificator)
    : IRequestHandler<JoinQueueCommand, Result>
{
    public async ValueTask<Result> HandleAsync(JoinQueueCommand request, CancellationToken cancellationToken)
    {
        var statistics = await unitOfWork.UserStatistics.GetByUserIdAsync(request.PlayerId, cancellationToken);
        if (statistics is null)
        {
            return Result.Fail("Пользователь не найден", ErrorCode.NotFound);
        }

        var result = matchmakingQueue.Enqueue(request.PlayerId, statistics.Rating);
        if (!result.IsSuccess)
        {
            return result;
        }

        await matchmakingNotificator.NotifyUpdateQueueAsync(cancellationToken);

        return Result.Ok();
    }
}
