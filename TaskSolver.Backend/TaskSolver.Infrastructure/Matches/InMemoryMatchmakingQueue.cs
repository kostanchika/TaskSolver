using System.Collections.Concurrent;
using TaskSolver.Core.Application.Matches.DTOs;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Infrastructure.Matches;

public sealed class InMemoryMatchmakingQueue
    : IMatchmakingQueue
{
    private readonly ConcurrentDictionary<Guid, QueueParticipantDto> _queue = [];

    public Result<QueueParticipantDto> Dequeue(Guid playerId)
    {
        if (_queue.TryRemove(playerId, out var participant))
        {
            return Result.Ok(participant);
        }

        return Result<QueueParticipantDto>.Fail("Пользователь в очереди не найден", ErrorCode.NotFound);
    }

    public Result Enqueue(Guid playerId, int rating)
    {
        var participant = new QueueParticipantDto(playerId, rating, DateTime.UtcNow);

        if (!_queue.TryAdd(playerId, participant))
        {
            return Result.Fail("Игрок уже находиться в очереди", ErrorCode.Conflict);
        }

        return Result.Ok();
    }

    public IEnumerable<QueueParticipantDto> GetQueueInfo()
        => [.. _queue.Values];

    public int? GetRatingDelta(Guid playerId)
    {
        if (!_queue.TryGetValue(playerId, out var participant))
            return null;

        var inQueueTime = DateTime.UtcNow - participant.JoinedAt;

        if (inQueueTime < TimeSpan.FromSeconds(5))
        {
            return 50;
        }

        if (inQueueTime < TimeSpan.FromSeconds(15))
        {
            return 250;
        }

        return 2000;
    }

    public List<(QueueParticipantDto, QueueParticipantDto)> GetPairs()
    {
        var participants = _queue.Values.OrderBy(p => p.Rating).ToList();
        var pairs = new List<(QueueParticipantDto, QueueParticipantDto)>();
        var used = new HashSet<Guid>();

        for (int i = 0; i < participants.Count; i++)
        {
            var p1 = participants[i];
            if (used.Contains(p1.PlayerId)) continue;

            var delta = GetRatingDelta(p1.PlayerId) ?? 0;

            var opponent = participants
                .Skip(i + 1)
                .FirstOrDefault(p2 =>
                    !used.Contains(p2.PlayerId) &&
                    Math.Abs(p1.Rating - p2.Rating) <= delta);

            if (opponent is not null)
            {
                _queue.TryRemove(p1.PlayerId, out _);
                _queue.TryRemove(opponent.PlayerId, out _);

                used.Add(p1.PlayerId);
                used.Add(opponent.PlayerId);

                pairs.Add((p1, opponent));
            }
        }

        return pairs;
    }
}
