namespace TaskSolver.Core.Application.Common.Models;

public sealed record TemporaryCode(
    string Code,
    DateTime Expiry
);