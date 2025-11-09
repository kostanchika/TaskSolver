using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Common.Models;

namespace TaskSolver.Infrastructure.Common;

public sealed class LocalFileStorage(
    string basePath)
    : IFileStorage
{
    public async Task<string> SaveAsync(
            UploadedFile file,
            string scope,
            bool changeName = true,
            CancellationToken cancellationToken = default)
    {
        var folderPath = Path.Combine(basePath, scope);
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var fileName = changeName
            ? $"{scope}/{Guid.NewGuid():N}{file.Extension}"
            : $"{scope}/{file.FileName}";
        var fullPath = Path.Combine(basePath, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await file.Content.CopyToAsync(stream, cancellationToken);

        return $"/{fileName}";
    }
}
