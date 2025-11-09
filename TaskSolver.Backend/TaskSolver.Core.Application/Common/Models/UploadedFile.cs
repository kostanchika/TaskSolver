namespace TaskSolver.Core.Application.Common.Models;

public sealed record UploadedFile(
    string FileName,
    Stream Content)
{
    public string Extension = Path.GetExtension(FileName).ToLowerInvariant();
}