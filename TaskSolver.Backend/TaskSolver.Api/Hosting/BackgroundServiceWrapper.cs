namespace TaskSolver.Api.Hosting;

public sealed class BackgroundServiceWrapper(
    Func<CancellationToken, Task> run) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return run(stoppingToken);
    }
}
