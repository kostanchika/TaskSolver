namespace TaskSolver.Core.Domain.Profiles.Constants;

public static class Platforms
{
    public const string GitHub = "GitHub";
    public const string LinkedIn = "LinkedIn";
    public const string Telegram = "Telegram";
    public const string WhatsApp = "WhatsApp";
    public const string Viber = "Viber";

    public static IEnumerable<string> List
        => [ GitHub, LinkedIn, Telegram, WhatsApp, Viber ];
}
