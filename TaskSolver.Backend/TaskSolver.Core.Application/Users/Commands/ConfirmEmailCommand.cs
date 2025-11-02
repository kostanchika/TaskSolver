using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record ConfirmEmailCommand(
    string Email,
    string Code)
    : IRequest<Result>;