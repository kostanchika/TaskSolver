namespace TaskSolver.Core.Domain.Abstractions.Results;

public sealed class Error
{
    public string Message { get; }
    public ErrorCode Code { get; }

    internal Error(string message, ErrorCode code)
    {
        Message = message;
        Code = code;
    }
}
