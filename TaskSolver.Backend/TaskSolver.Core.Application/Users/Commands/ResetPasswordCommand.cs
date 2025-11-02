using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record ResetPasswordCommand(
    string Email,
    string Code,
    string Password) 
    : IRequest<Result>;