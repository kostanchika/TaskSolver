using MitMediator;
using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Handlers;

public sealed class LeaveQueueHandler(
    IMatchmakingQueue matchmakingQueue,
    IMatchmakingNotificator matchmakingNotificator)
    : IRequestHandler<LeaveQueueCommand, Result>
{
    public async ValueTask<Result> HandleAsync(LeaveQueueCommand request, CancellationToken cancellationToken)
    {
        var result = matchmakingQueue.Dequeue(request.PlayerId);
        if (!result.IsSuccess)
        {
            return Result.Fail(result.Error.Message, result.Error.Code);
        }

        await matchmakingNotificator.NotifyUpdateQueueAsync(cancellationToken);

        return Result.Ok();
    }
}
