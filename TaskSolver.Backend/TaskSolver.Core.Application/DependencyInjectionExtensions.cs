using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MitMediator;
using TaskSolver.Core.Application.Common.Behaviors;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.Validators;

namespace TaskSolver.Core.Application;

public static class DependencyInjectionExtensions
{
    internal static IServiceCollection AddMitMediatorRouting(this IServiceCollection services)
    {
        return services.AddMitMediator(typeof(RegisterViaPasswordCommand).Assembly)
            .AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
    }
    
    internal static IServiceCollection AddValidation(this IServiceCollection services)
    {
        return services.AddValidatorsFromAssembly(typeof(RegisterViaPasswordValidator).Assembly);
    }

    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        return services
            .AddMitMediatorRouting()
            .AddValidation();
    }
}
