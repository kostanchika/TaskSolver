namespace TaskSolver.Core.Domain.Abstractions.Results;

public enum ErrorCode
{
    Validation = 0,
    BadRequest = 1,
    NotFound = 2,
    Conflict = 3,
    Unauthorized = 4,
    Forbidden = 5,
    Internal = 6,
}
