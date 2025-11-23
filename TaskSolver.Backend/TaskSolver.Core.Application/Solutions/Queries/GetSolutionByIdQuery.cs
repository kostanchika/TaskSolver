using MitMediator;
using TaskSolver.Core.Application.Solutions.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Solutions.Queries;

public sealed record GetSolutionByIdQuery(
    Guid Id)
    : IRequest<Result<SolutionDto>>;