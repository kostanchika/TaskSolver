using TaskSolver.Core.Application.Common.Models;

namespace TaskSolver.Core.Application.Common.Interfaces;

public interface IFileStorage
{
    Task<string> SaveAsync(
        UploadedFile file,
        string scope,
        bool changeName = true,
        CancellationToken cancellationToken = default);
}
