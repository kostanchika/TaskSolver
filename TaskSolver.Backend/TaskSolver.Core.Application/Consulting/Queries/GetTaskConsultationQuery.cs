using MitMediator;
using TaskSolver.Core.Application.Consulting.Models;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Core.Application.Consulting.Queries;

public sealed record GetTaskConsultationQuery(
    Guid TaskId,
    Guid UserId,
    string? Question)
    : IRequest<Result<ConsultMessage>>;