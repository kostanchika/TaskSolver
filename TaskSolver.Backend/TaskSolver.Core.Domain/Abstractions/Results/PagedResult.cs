namespace TaskSolver.Core.Domain.Abstractions.Results;

public sealed record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount
);