using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Users.Commands;

public sealed record RequestResetPasswordCommand(
    string Email    
) : IRequest<Result>;