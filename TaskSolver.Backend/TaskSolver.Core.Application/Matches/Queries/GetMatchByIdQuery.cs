using MitMediator;
using TaskSolver.Core.Application.Matches.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Matches.Queries;

public sealed record GetMatchByIdQuery(
    Guid MatchId)
    : IRequest<Result<MatchDto>>;