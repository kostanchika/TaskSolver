using TaskSolver.Core.Domain.Abstractions.Common;

namespace TaskSolver.Core.Domain.ProgrammingLanguages;

public sealed class ProgrammingLanguage : AggregateRoot
{
    public string Name { get; set; }
    public string Version { get; set; }
    public string? Extra { get; set; }
    public string IconUrl { get; set; }
    public string FileExtension { get; set; }
    public string Interpretor { get; set; }

    private ProgrammingLanguage()
    {
        Name = null!;
        Version = null!;
        Extra = null!;
        IconUrl = null!;
        FileExtension = null!;
        Interpretor = null!;
    }

    public ProgrammingLanguage(
        string name,
        string version,
        string? extra,
        string iconUrl,
        string fileExtension,
        string interpretor)
    {
        ArgumentNullException.ThrowIfNull(name);
        ArgumentNullException.ThrowIfNull(version);
        ArgumentNullException.ThrowIfNull(iconUrl);
        ArgumentNullException.ThrowIfNull(fileExtension);
        ArgumentNullException.ThrowIfNull(interpretor);

        Name = name;
        Version = version;
        Extra = extra;
        IconUrl = iconUrl;
        FileExtension = fileExtension;
        Interpretor = interpretor;
    }
}
