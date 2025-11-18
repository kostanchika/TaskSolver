using MitMediator;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Comments.Commands;

public sealed record DeleteCommentCommand(
    Guid CommentId,
    Guid UserId)
    : IRequest<Result>;