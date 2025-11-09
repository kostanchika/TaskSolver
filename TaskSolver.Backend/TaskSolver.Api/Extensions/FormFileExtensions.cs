using TaskSolver.Core.Application.Common.Models;

namespace TaskSolver.Api.Extensions;

public static class FormFileExtensions
{
    public static UploadedFile ToUploadedFile(this IFormFile formFile)
    {
        return new UploadedFile(
            formFile.FileName,
            formFile.OpenReadStream());
    }
}

