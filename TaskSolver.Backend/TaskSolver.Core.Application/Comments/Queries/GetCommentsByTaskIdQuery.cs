using MitMediator;
using TaskSolver.Core.Application.Comments.DTOs;

namespace TaskSolver.Core.Application.Comments.Queries;

public sealed record GetCommentsByTaskIdQuery(
    Guid TaskId)
    : IRequest<IReadOnlyList<CommentDto>>;