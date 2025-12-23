using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Matches.DTOs;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Application.Matches.Queries;
using TaskSolver.Core.Domain.Matches;

namespace TaskSolver.Core.Application.Matches.Handlers;

public sealed class GetQueueInfoHandler(
    IMatchmakingQueue matchmakingQueue,
    IUnitOfWork unitOfWork)
    : IRequestHandler<GetQueueInfoQuery, QueueInfoDto>
{
    public async ValueTask<QueueInfoDto> HandleAsync(GetQueueInfoQuery request, CancellationToken cancellationToken)
    {
        var queueParticipants = matchmakingQueue.GetQueueInfo();

        int playersCount = queueParticipants.Count();
        var avgRating = queueParticipants.Select(p => p.Rating)
            .DefaultIfEmpty(0)
            .Average();

        var currentPlayer = queueParticipants.FirstOrDefault(p => p.PlayerId == request.PlayerId);

        Match? match = request.PlayerId.HasValue ?
            await unitOfWork.Matches.GetByActiveByPlayerIdAsync(request.PlayerId.Value, cancellationToken)
            : null;

        if (currentPlayer is not null)
        {
            var playerQueueInfo = new QueueInfoDto(
                playersCount,
                (int)Math.Floor(avgRating),
                DateTime.UtcNow - currentPlayer.JoinedAt,
                currentPlayer.Rating,
                matchmakingQueue.GetRatingDelta(currentPlayer.PlayerId),
                match?.Id);

            return playerQueueInfo;
        }

        var queueInfo = new QueueInfoDto(
            playersCount,
            (int)Math.Floor(avgRating),
            null,
            null,
            null,
            match?.Id);

        return queueInfo;
    }
}
