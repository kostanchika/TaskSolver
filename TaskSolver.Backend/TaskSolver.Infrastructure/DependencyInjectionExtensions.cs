using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using TaskSolver.Core.Application.Common.Interfaces;
using TaskSolver.Core.Application.Consulting.Interfaces;
using TaskSolver.Core.Application.Profiles.Handlers.Events;
using TaskSolver.Core.Application.Solutions.Interfaces;
using TaskSolver.Core.Application.Users.Interfaces;
using TaskSolver.Core.Domain.Abstractions.Events;
using TaskSolver.Infrastructure.Auth;
using TaskSolver.Infrastructure.Auth.Configurations;
using TaskSolver.Infrastructure.Common;
using TaskSolver.Infrastructure.Common.Events;
using TaskSolver.Infrastructure.Consulting;
using TaskSolver.Infrastructure.Solutions;

namespace TaskSolver.Infrastructure;

public static class DependencyInjectionExtensions
{
    internal static IServiceCollection AddCommonModule(this IServiceCollection services)
    {
        return services
            .AddTransient<ICodeGenerator, NumericCodeGenerator>()
            .AddSingleton<IFileStorage>(_ =>
            {
                return new LocalFileStorage("wwwroot");
            });
    }

    internal static IServiceCollection AddSignalRModule(this IServiceCollection services)
    {
        services.AddSignalR();

        return services;
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

    internal static IServiceCollection AddSolutionsModule(this IServiceCollection services)
    {
        return services
            .AddSingleton<ISolutionNotificator, SignalRSolutionNotificator>();
    }

    internal static IServiceCollection AddConsultingModule(this IServiceCollection services)
    {
        return services
            .AddTransient<ITaskConsultant, MistralTaskConsultant>();
    }

    public static IServiceCollection AddEvents(this IServiceCollection services)
    {
        services.AddSingleton<EventQueue>();
        services.AddSingleton<EventDispatcher>();
        services.AddTransient<IEventPublisher, EventPublisher>();

        var handlerInterface = typeof(IDomainEventHandler<>);

        var handlers = typeof(UserCreatedHandler).Assembly
            .GetTypes()
            .Where(t => !t.IsAbstract && !t.IsInterface)
            .SelectMany(t => t.GetInterfaces(), (type, iface) => new { type, iface })
            .Where(x => x.iface.IsGenericType && x.iface.GetGenericTypeDefinition() == handlerInterface)
            .ToList();

        foreach (var h in handlers)
        {
            services.AddTransient(h.iface, h.type);
        }

        return services;
    }

    public static IServiceCollection AddInfrastructre(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .AddCommonModule()
            .AddSignalRModule()
            .AddEvents()
            .AddAuthModule(configuration)
            .AddSolutionsModule()
            .AddConsultingModule();
    }
}
