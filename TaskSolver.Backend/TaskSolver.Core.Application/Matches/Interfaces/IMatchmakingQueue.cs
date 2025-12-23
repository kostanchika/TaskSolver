using TaskSolver.Core.Application.Matches.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Interfaces;

public interface IMatchmakingQueue
{
    Result Enqueue(Guid playerId, int rating);
    Result<QueueParticipantDto> Dequeue(Guid playerId);

    int? GetRatingDelta(Guid playerId);

    IEnumerable<QueueParticipantDto> GetQueueInfo();

    List<(QueueParticipantDto, QueueParticipantDto)> GetPairs();
}
