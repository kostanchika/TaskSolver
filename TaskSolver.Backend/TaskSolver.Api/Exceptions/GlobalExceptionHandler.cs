using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TaskSolver.Api.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        var code = "INTERNAL";
        string? detail = null;
        var errors = new Dictionary<string, string[]>();

        if (exception is ValidationException validationException)
        {
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            errors = validationException.Errors
                .GroupBy(e => e.PropertyName.ToLowerInvariant())
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );
        }

        httpContext.Response.ContentType = "application/problem+json";

        var title = httpContext.Response.StatusCode == StatusCodes.Status500InternalServerError
            ? "An error occured, try again later."
            : exception.Message;

        if (exception is ValidationException)
        {
            title = "Validation exception";
            code = "VALIDATION";
            detail = "Произошла ошибка валидации";
        }

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{httpContext.Response.StatusCode}",
            Title = title,
            Status = httpContext.Response.StatusCode,
            Instance = httpContext.Request.Path.Value,
            Detail = detail,
            Extensions =
            {
                ["code"] = code,
                ["errors"] = errors,
            }
        }, cancellationToken);

        return true;
    }
}
