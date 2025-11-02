using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Infrastructure.Auth;
using TaskSolver.Infrastructure.Auth.Configurations;
using TaskSolver.Infrastructure.Common;

namespace TaskSolver.Infrastructure;

public static class DependencyInjectionExtensions
{
    internal static IServiceCollection AddCommonModule(this IServiceCollection services)
    {
        return services
            .AddTransient<ICodeGenerator, NumericCodeGenerator>();
    }

    internal static IServiceCollection AddAuthModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtConfiguration>(configuration.GetSection("Jwt"));
        services.Configure<EmailConfiguration>(configuration.GetSection("Email"));

        services.AddTransient<IPasswordHasher, Argon2PasswordHasher>();
        services.AddTransient<ITokenGenerator, JwtTokenGenerator>();
        services.AddTransient<IEmailSender, EmailSender>();

        var emailSettings = configuration.GetSection("Email").Get<EmailConfiguration>()!;

        services.AddFluentEmail(emailSettings.Sender, emailSettings.Name)
            .AddSmtpSender(new System.Net.Mail.SmtpClient(emailSettings.Host)
            {
                Port = emailSettings.Port,
                Credentials = new NetworkCredential(emailSettings.Login, emailSettings.Password),
                EnableSsl = true,
            });

        return services;
    }

    public static IServiceCollection AddInfrastructre(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .AddCommonModule()
            .AddAuthModule(configuration);
    }
}
