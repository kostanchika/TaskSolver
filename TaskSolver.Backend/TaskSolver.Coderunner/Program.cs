using System.Diagnostics;
using System.Text;

namespace TaskSolver.Coderunner;

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

        app.MapPost("/run", async (RunRequest request) =>
        {
            string tmpFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + '.' + request.FileExtension);
            await File.WriteAllTextAsync(tmpFile, request.Code);

            var psi = new ProcessStartInfo
            {
                FileName = request.Interpretor.Split(' ')[0],
                Arguments = $"{string.Join(' ', request.Interpretor.Split(' ').Skip(1))} {tmpFile}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                RedirectStandardInput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                StandardOutputEncoding = Encoding.UTF8,
                StandardErrorEncoding = Encoding.UTF8,
                StandardInputEncoding = new UTF8Encoding(false),
                WorkingDirectory = "/"
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

        app.MapGet("/status", () =>
        {
            var process = Process.GetCurrentProcess();

            var cpuTime = process.TotalProcessorTime.TotalSeconds;
            var uptime = DateTime.UtcNow - process.StartTime.ToUniversalTime();
            var cpuUsagePercent = cpuTime / uptime.TotalSeconds / Environment.ProcessorCount * 100;

            var memoryWorkingSetMb = process.WorkingSet64 / 1024 / 1024;
            var totalMemoryMb = GC.GetGCMemoryInfo().TotalAvailableMemoryBytes / 1024 / 1024;

            var drives = DriveInfo.GetDrives()
                .Where(d => d.IsReady)
                .Select(d => new {
                    d.Name,
                    TotalGb = d.TotalSize / 1024d / 1024d / 1024d,
                    FreeGb = d.AvailableFreeSpace / 1024d / 1024d / 1024d,
                    UsedGb = (d.TotalSize - d.AvailableFreeSpace) / 1024d / 1024d / 1024d
                });

            var netSent = process.PagedSystemMemorySize64 / 1024 / 1024;
            var netReceived = process.PagedMemorySize64 / 1024 / 1024;

            return new
            {
                ServerTime = DateTime.UtcNow,
                Uptime = uptime,
                CpuUsagePercent = Math.Round(cpuUsagePercent, 2),
                MemoryWorkingSetMb = memoryWorkingSetMb,
                TotalMemoryMb = totalMemoryMb,
                Drives = drives,
                Threads = process.Threads.Count
            };
        });

        app.Run();
    }
}