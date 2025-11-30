using MitMediator;
using TaskSolver.Core.Application.Profiles.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Profiles.Queries;

public sealed record GetProfilesQuery(
    string? Email,
    string? ProfileName,
    int? Page,
    int? PageSize)
    : IRequest<PagedResult<AdminProfileDto>>;