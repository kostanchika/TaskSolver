using Microsoft.EntityFrameworkCore;
using TaskSolver.Core.Application.Constructor.Interfaces;
using TaskSolver.Core.Domain.Constructor;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense.Repositories;

internal sealed class TaskChatRepository(
    AppDbContext context)
    : ITaskChatRepository
{
    public async Task AddAsync(TaskChat taskChat)
    {
        await context.TaskChats.AddAsync(taskChat);
    }

    public Task DeleteAsync(TaskChat taskChat)
    {
        context.TaskChats.Remove(taskChat);

        return Task.CompletedTask;
    }

    public Task<List<TaskChat>> GetAllAsync()
    {
        return context.TaskChats.ToListAsync();
    }

    public Task<TaskChat> GetByIdAsync(Guid id)
    {
        return context.TaskChats.FirstOrDefaultAsync(c => c.Id == id);
    }
}
