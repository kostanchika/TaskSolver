using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskSolver.Core.Application.Common;
using TaskSolver.Infrastructure.Persistense.Contexts;

namespace TaskSolver.Infrastructure.Persistense;

public static class DependencyInjectionExtensions
{
    internal static IServiceCollection ConfigureDb(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(
            configuration.GetConnectionString("Postgres")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }

    public static IServiceCollection AddPersistense(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .ConfigureDb(configuration);
    }
}
