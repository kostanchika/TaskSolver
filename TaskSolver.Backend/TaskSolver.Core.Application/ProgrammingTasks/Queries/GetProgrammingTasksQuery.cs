using MitMediator;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;

namespace TaskSolver.Core.Application.ProgrammingTasks.Queries;

// TODO filters
public sealed record GetProgrammingTasksQuery()
    : IRequest<IReadOnlyList<ProgrammingTaskDto>>;