
using MitMediator;
using TaskSolver.Core.Application.Matches.Commands;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Hosting;

public sealed class MatchmakingQueueService(
    IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();

            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            var command = new StartGamesCommand();

            await mediator.SendAsync<StartGamesCommand, Unit>(
                command,
                stoppingToken);

            await Task.Delay(1000, stoppingToken);
        }
    }
}
