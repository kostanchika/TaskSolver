using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Comments.Commands;

public sealed record CreateCommentCommand(
    Guid UserId,
    Guid TaskId,
    Guid? ParentId,
    string Content)
    : IRequest<Result<Guid>>;