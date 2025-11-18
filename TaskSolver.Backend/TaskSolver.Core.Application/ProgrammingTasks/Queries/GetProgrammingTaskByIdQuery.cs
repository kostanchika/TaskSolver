using MitMediator;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingTasks.Queries;

public sealed record GetProgrammingTaskByIdQuery(
    Guid Id)
    : IRequest<Result<ProgrammingTaskDto>>;