using Microsoft.AspNetCore.Mvc;
using TaskSolver.Core.Domain.Abstractions.Results;

namespace TaskSolver.Api.Common;

[ApiController]
public class ApiBaseController : ControllerBase
{
    protected IActionResult HandleFailure(Result result)
    {
        if (result.Error == null)
        {
            var unknownProblem = new ProblemDetails
            {
                Title = "Неизвестная ошибка",
                Detail = "Произошла непредвиденная ошибка.",
                Status = StatusCodes.Status500InternalServerError,
                Type = "https://httpstatuses.com/500",
                Instance = HttpContext.Request.Path
            };

            return StatusCode(500, unknownProblem);
        }

        var statusCode = result.Error.Code switch
        {
            ErrorCode.Validation => StatusCodes.Status400BadRequest,
            ErrorCode.BadRequest => StatusCodes.Status400BadRequest,
            ErrorCode.NotFound => StatusCodes.Status404NotFound,
            ErrorCode.Conflict => StatusCodes.Status409Conflict,
            ErrorCode.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorCode.Forbidden => StatusCodes.Status403Forbidden,
            ErrorCode.Internal => StatusCodes.Status500InternalServerError,
            _ => StatusCodes.Status500InternalServerError
        };

        var problem = new ProblemDetails
        {
            Title = "Произошла ошибка",
            Detail = result.Error.Message,
            Status = statusCode,
            Type = $"https://httpstatuses.com/{statusCode}",
            Instance = HttpContext.Request.Path
        };

        problem.Extensions["code"] = result.Error.Code.ToString();

        return new ObjectResult(problem)
        {
            StatusCode = statusCode
        };
    }

    protected ActionResult<T> HandleFailure<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        var statusCode = result.Error.Code switch
        {
            ErrorCode.Validation => StatusCodes.Status400BadRequest,
            ErrorCode.BadRequest => StatusCodes.Status400BadRequest,
            ErrorCode.NotFound => StatusCodes.Status404NotFound,
            ErrorCode.Conflict => StatusCodes.Status409Conflict,
            ErrorCode.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorCode.Forbidden => StatusCodes.Status403Forbidden,
            ErrorCode.Internal => StatusCodes.Status500InternalServerError,
            _ => StatusCodes.Status500InternalServerError
        };

        var problem = new ProblemDetails
        {
            Title = "Произошла ошибка",
            Detail = result.Error.Message,
            Status = statusCode,
            Type = $"https://httpstatuses.com/{statusCode}",
            Instance = HttpContext.Request.Path,
        };

        problem.Extensions["code"] = result.Error.Code.ToString().ToUpperInvariant();

        return new ObjectResult(problem)
        {
            StatusCode = statusCode
        };
    }
}