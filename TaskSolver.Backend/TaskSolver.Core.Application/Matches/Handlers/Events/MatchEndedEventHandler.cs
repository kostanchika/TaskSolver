using System.Threading;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Domain.Abstractions.Events;
using TaskSolver.Core.Domain.Matches.Events;

namespace TaskSolver.Core.Application.Matches.Handlers.Events;

public sealed class MatchEndedEventHandler(
    IUnitOfWork unitOfWork)
    : IDomainEventHandler<MatchEndedEvent>
{
    private const int BASE_CHANGE = 30;
    private const int MAX_CHANGE = 50;
    private const int MIN_CHANGE = 10;
    private const int CHANGE_RATE = 5;

    public async Task HandleAsync(MatchEndedEvent @event)
    {
        var match = await unitOfWork.Matches.GetByIdAsync(@event.MatchId);

        var winnerStatistics = await unitOfWork.UserStatistics.GetByUserIdAsync(@event.WinnerId);
        var loserStatistics = await unitOfWork.UserStatistics.GetByUserIdAsync(
            @event.WinnerId == match!.Player1Id
                ? match.Player2Id
                : match.Player1Id);

        var difference = winnerStatistics!.Rating - loserStatistics!.Rating;

        var differenceCoefficient = difference / 50;

        var outputDifference = BASE_CHANGE - differenceCoefficient * CHANGE_RATE;

        var ratingChange = Math.Min(Math.Max(outputDifference, MIN_CHANGE), MAX_CHANGE);

        winnerStatistics.Rating += ratingChange;

        await unitOfWork.CommitAsync();
    }
}
