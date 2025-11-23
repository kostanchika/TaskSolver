using System.Diagnostics;
using System.Text;

namespace CodeRunner;

public sealed class Program
{
    private record RunRequest(
        string Code,
        string Input,
        string Interpretor,
        string Args,
        string FileExtension);

    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var app = builder.Build();

        app.MapPost("/run", async (RunRequest request ) =>
        {
            string tmpFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + request.FileExtension);
            await File.WriteAllTextAsync(tmpFile, request.Code);

            var psi = new ProcessStartInfo
            {
                FileName = request.Interpretor,
                Arguments = $"{request.Args}{tmpFile}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                RedirectStandardInput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                StandardOutputEncoding = Encoding.UTF8,
                StandardErrorEncoding = Encoding.UTF8,
                StandardInputEncoding = new UTF8Encoding(false)
            };

            using var process = Process.Start(psi);

            if (process is null)
            {
                return new { Stdout = "", Stderr = "Недостаточно ресурсов для запуска" };
            }

            if (!string.IsNullOrEmpty(request.Input))
            {
                await process.StandardInput.WriteAsync(request.Input.Trim());
                process.StandardInput.Close();
            }

            psi.EnvironmentVariables["PYTHONUTF8"] = "1";

            string stdout = await process.StandardOutput.ReadToEndAsync();
            string stderr = await process.StandardError.ReadToEndAsync();
            process.WaitForExit();

            File.Delete(tmpFile);

            return new { Stdout = stdout.Trim(), Stderr = stderr.Trim() };
        });

        app.Run();
    }
}