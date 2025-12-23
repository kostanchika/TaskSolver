using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Controllers.Solutions.Requests;
using TaskSolver.Core.Application.Solutions.Commands;
using TaskSolver.Core.Application.Solutions.DTOs;
using TaskSolver.Core.Application.Solutions.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Controllers.Solutions;

[Route("api/solutions")]
[ApiController]
public class SolutionsController(
    IMediator mediator,
    IServiceScopeFactory factory)
    : ControllerBase
{
    [HttpGet("task/{taskId:guid}")]
    [Authorize]
    public async Task<IEnumerable<SolutionDto>> GetUserSolutionsByTaskIdAsync(
        [FromRoute] Guid taskId,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = new GetUserSolutionsQuery(userId, taskId);

        var solutions = await mediator.SendAsync<GetUserSolutionsQuery, IEnumerable<SolutionDto>>(
            query,
            cancellationToken);

        return solutions;
    }

    [HttpPost("task/{taskId:guid}")]
    [Authorize]
    public ActionResult<Guid> SendSolution(
        [FromRoute] Guid taskId,
        [FromBody] SendSolutionRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Hangfire
        _ = Task.Run(async () =>
        {
            using var scope = factory.CreateScope();

            var command = request.ToCommand(userId, taskId);

            var scopedMediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            var id = await scopedMediator.SendAsync<SendSolutionCommand, Result<Guid>>(
                command,
                cancellationToken);
        }, CancellationToken.None);

        return Accepted();
    }
}
