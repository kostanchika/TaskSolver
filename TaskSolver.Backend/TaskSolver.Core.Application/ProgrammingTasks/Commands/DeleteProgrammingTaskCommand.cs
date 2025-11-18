using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.ProgrammingTasks.Commands;

public sealed record DeleteProgrammingTaskCommand(
    Guid Id)
    : IRequest<Result>;