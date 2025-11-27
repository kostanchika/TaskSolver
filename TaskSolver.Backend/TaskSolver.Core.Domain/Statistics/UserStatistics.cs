using TaskSolver.Core.Domain.Abstractions.Common;
using TaskSolver.Core.Domain.Users;

namespace TaskSolver.Core.Domain.Statistics;

public sealed class UserStatistics : AggregateRoot
{
    public User User { get; }

    public int Rating { get; set; }

    public int TotalSolutions { get; set; }
    public int GoodSolutions { get; set; }

    public List<TaskRatingHistory> TaskHistory { get; }

    private UserStatistics() 
    {
        User = null!;
        TaskHistory = null!;
    }

    public UserStatistics(User user)
    {
        User = user;
        TaskHistory = [];
    }

    public void AddHistory(Guid taskId, int difference)
    {
        TaskHistory.Add(new TaskRatingHistory(taskId, difference));
    }
}
