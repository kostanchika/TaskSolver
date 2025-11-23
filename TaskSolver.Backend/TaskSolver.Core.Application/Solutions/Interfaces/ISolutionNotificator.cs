namespace TaskSolver.Core.Application.Solutions.Interfaces;

public interface ISolutionNotificator
{
    Task NotifiySolutionCompleted(Guid userId, Guid solutionId, CancellationToken cancellationToken = default);
}
