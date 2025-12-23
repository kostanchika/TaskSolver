using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MitMediator;
using System.Security.Claims;
using TaskSolver.Api.Common;
using TaskSolver.Api.Controllers.ProgrammingTasks.Requests;
using TaskSolver.Core.Application.ProgrammingTasks.Commands;
using TaskSolver.Core.Application.ProgrammingTasks.DTOs;
using TaskSolver.Core.Application.ProgrammingTasks.Queries;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Core.Domain.Users.Constants;

namespace TaskSolver.Api.Controllers.ProgrammingTasks;

[Route("api/tasks")]
[ApiController]
public sealed class TasksController(IMediator mediator)
    : ApiBaseController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<PagedResult<ProgrammingTaskWithMarkDto>> GetAllAsync(
        [FromQuery] GetProgrammingTasksRequest request,
        CancellationToken cancellationToken)
    {
        Guid? userId = null;

        if (User?.Identity?.IsAuthenticated == true)
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(claim, out var parsed))
            {
                userId = parsed;
            }
        }

        var query = request.ToQuery(userId);

        return await mediator.SendAsync<GetProgrammingTasksQuery, PagedResult<ProgrammingTaskWithMarkDto>>(
            query,
            cancellationToken);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProgrammingTaskDto>> GetByIdAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetProgrammingTaskByIdQuery(id);

        var result = await mediator.SendAsync<GetProgrammingTaskByIdQuery, Result<ProgrammingTaskDto>>(
            query,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return HandleFailure(result);
        }

        return result.Value;
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<ActionResult<ProgrammingTaskDto>> CreateAsync(
        [FromBody] CreateProgrammingTaskRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand();

        var id = await mediator.SendAsync<CreateProgrammingTaskCommand, Guid>(
            command,
            cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<ActionResult<ProgrammingTaskDto>> UpdateAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateProgrammingTaskRequest request,
        CancellationToken cancellationToken)
    {
        var command = request.ToCommand(id);

        await mediator.SendAsync<UpdateProgrammingTaskCommand, Result>(
            command,
            cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task DeleteAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var command = new DeleteProgrammingTaskCommand(id);

        await mediator.SendAsync<DeleteProgrammingTaskCommand, Result>(
            command,
            cancellationToken);
    }
}
