using TaskSolver.Core.Application.Consulting.Queries;

namespace TaskSolver.Api.Controllers.Consulting.Requests;

public sealed record GetConsultationRequest(
    string? Question)
{
    public GetTaskConsultationQuery ToQuery(Guid taskId, Guid userId)
        => new(taskId, userId, Question);
}
