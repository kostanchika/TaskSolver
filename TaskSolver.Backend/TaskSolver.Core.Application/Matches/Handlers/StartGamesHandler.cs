using MitMediator;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Application.Matches.Interfaces;
using TaskSolver.Core.Domain.Matches;
using TaskSolver.Core.Domain.Tasks.Enums;

namespace TaskSolver.Core.Application.Matches.Handlers;

public sealed class StartGamesHandler(
    IUnitOfWork unitOfWork,
    IMatchmakingQueue matchmakingQueue,
    IMatchmakingNotificator matchmakingNotificator)
    : IRequestHandler<StartGamesCommand, Unit>
{
    private static readonly List<Guid> _activeMatches = [];

    public async ValueTask<Unit> HandleAsync(StartGamesCommand request, CancellationToken cancellationToken)
    {
        var pairs = matchmakingQueue.GetPairs();

        var matches = new List<Match>();

        foreach (var pair in pairs)
        {
            var tasks = await unitOfWork.ProgrammingTasks.GetAllBySigilAsync(Sigil.Two, cancellationToken);

            var taskSlots = tasks.Take(3)
                .Select((t, i) => new TaskSlot(t.Id, i));

            var match = new Match(pair.Item1.PlayerId, pair.Item2.PlayerId, taskSlots, DateTime.UtcNow.AddMinutes(10));

            matches.Add(match);
            _activeMatches.Add(match.Id);

            await unitOfWork.Matches.AddAsync(match, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            await matchmakingNotificator.NotifyMatchStartedAsync(
                match.Id,
                match.Player1Id,
                match.Player2Id,
                cancellationToken);
        }

        if (matches.Count > 0)
        {
            await matchmakingNotificator.NotifyUpdateQueueAsync(cancellationToken);
        }

        var startDate = DateTime.UtcNow;

        var matchesToRemove = new List<Guid>();

        foreach (var matchId in _activeMatches)
        {
            var match = await unitOfWork.Matches.GetByIdAsync(matchId, cancellationToken);

            if (match!.EndsAt > startDate)
            {
                continue;
            }
            if (match.EndedAt is not null)
            {
                matchesToRemove.Add(matchId);
                continue;
            }

            var player1SolvedCount = match.SolveRecords.Count(r => r.UserId == match.Player1Id);
            var player2SolvedCount = match.SolveRecords.Count(r => r.UserId == match.Player2Id);

            if (player1SolvedCount > player2SolvedCount)
            {
                match.End(match.Player1Id);
            }
            else if (player2SolvedCount > player1SolvedCount)
            {
                match.End(match.Player2Id);
            }
            else
            {
                var player1Statistics = await unitOfWork.UserStatistics.GetByUserIdAsync(match.Player1Id, cancellationToken);
                var player2Statistics = await unitOfWork.UserStatistics.GetByUserIdAsync(match.Player2Id, cancellationToken);

                if (player1Statistics!.Rating < player2Statistics!.Rating)
                {
                    match.End(match.Player1Id);
                }
                else
                {
                    match.End(match.Player2Id);
                }
            }

            await unitOfWork.CommitAsync(cancellationToken);
            matchesToRemove.Add(matchId);
            await matchmakingNotificator.NotifyMatchUpdatedAsync(match.Player1Id, match.Player2Id, cancellationToken);
        }

        _activeMatches.RemoveAll(matchesToRemove.Contains);

        return Unit.Value;
    }
}
