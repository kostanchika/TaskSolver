namespace TaskSolver.Core.Domain.Abstractions.Results;

public sealed class Result
{
    public bool IsSuccess { get; }

    private readonly Error? _error;
    public Error Error
    {
        get => _error ?? throw new InvalidOperationException(
            "Cannot access Error when result is success or error is null.");
    }

    private Result(bool isSuccess, Error? error)
    {
        IsSuccess = isSuccess;
        _error = error;
    }

    public static Result Ok() 
        => new(true, null);

    public static Result Fail(string message, ErrorCode code)
        => new(false, new Error(message, code));
}

public sealed class Result<T>
{
    public bool IsSuccess { get; }

    private readonly T? _value;
    public T Value
    {
        get => _value ?? throw new InvalidOperationException(
            "Cannot access Value when result is failure or value is null.");
    }

    private readonly Error? _error;
    public Error Error {
        get => _error ?? throw new InvalidOperationException(
            "Cannot access Error when result is success or error is null.");
    }

    private Result(bool isSuccess, T? value, Error? error)
    {
        IsSuccess = isSuccess;
        _value = value;
        _error = error;
    }

    public static Result<T> Ok(T value)
        => new(true, value, null);

    public static Result<T> Fail(string message, ErrorCode code)
        => new(false, default, new Error(message, code));

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<Error, TResult> onFailure) 
        => IsSuccess ? onSuccess(Value!) : onFailure(Error!);
}
