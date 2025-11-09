using MitMediator;
using TaskSolver.Core.Application.Common.Models;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Commands;

public sealed record UpdateAvatarCommand(
    Guid UserId,
    UploadedFile Avatar    
) : IRequest<Result>;