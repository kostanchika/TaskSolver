using TaskSolver.Core.Domain.Constructor;

namespace TaskSolver.Core.Application.Constructor.Interfaces;

public interface ITaskChatRepository
{
    Task<List<TaskChat>> GetAllAsync();
    Task<TaskChat> GetByIdAsync(Guid id);

    Task AddAsync(TaskChat taskChat);
    Task DeleteAsync(TaskChat taskChat);
}
