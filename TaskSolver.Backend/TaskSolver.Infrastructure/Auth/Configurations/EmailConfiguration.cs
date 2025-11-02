namespace TaskSolver.Infrastructure.Auth.Configurations;

public sealed class EmailConfiguration
{
    public string Host { get; set; } = null!;
    public int Port { get; set; }
    public string Sender { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Login { get; set; } = null!;
    public string Password { get; set; } = null!;
}
