using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Commands;

public sealed record DeleteAvatarCommand(
    Guid UserId)
    : IRequest<Result>;