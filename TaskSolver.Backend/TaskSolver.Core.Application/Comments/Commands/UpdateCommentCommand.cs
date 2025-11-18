using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Comments.Commands;

public sealed record UpdateCommentCommand(
    Guid CommentId,
    Guid UserId,
    string Content)
    : IRequest<Result>;