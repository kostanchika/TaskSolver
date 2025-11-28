using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.Consulting.Requests;
using TaskSolver.Core.Application.Consulting.Models;
using TaskSolver.Core.Application.Consulting.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Consulting;

[Route("api/consulting")]
[ApiController]
public sealed class ConsultingController(IMediator mediator)
    : ApiBaseController
{
    [HttpGet("{taskId:guid}")]
    [Authorize]
    public async Task<ActionResult<ConsultMessage>> AskQuestionAsync(
        [FromRoute] Guid taskId,
        [FromQuery] GetConsultationRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = request.ToQuery(taskId, userId);

        var result = await mediator.SendAsync<GetTaskConsultationQuery, Result<ConsultMessage>>(
            query,
            cancellationToken);
        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }
}
