using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using TaskSolver.Api.Exceptions;
using TaskSolver.Api.Extensions;
using TaskSolver.Core.Application;
using TaskSolver.Core.Domain.Users;
using TaskSolver.Infrastructure;
using TaskSolver.Infrastructure.Persistense;
using TaskSolver.Infrastructure.Persistense.Contexts;
using TaskSolver.Infrastructure.Solutions.Hubs;

namespace TaskSolver.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.ConfigureLogger();
        builder.Services.AddSwaggerAuth();
        builder.Services.AddHttpClient();

        builder.Services.AddProblemDetails();
        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

        builder.Services.AddApplication()
            .AddPersistense(builder.Configuration)
            .AddInfrastructre(builder.Configuration)
            .HostEvents();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options => {
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];

                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) &&
                        path.StartsWithSegments("/solutionsHub"))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                }
            };

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
            };
        })
        .AddCookie()
        .AddGithubOAuth(builder.Configuration)
        .AddGoogleOAuth(builder.Configuration);

        var app = builder.Build();

        app.UseWebSockets();
        
        app.UseCors(options =>
        {
            options.WithOrigins(["http://localhost:5173"]);
            options.AllowAnyHeader();
            options.AllowAnyMethod();
            options.AllowCredentials();
        });

        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

                var problemDetails = new ProblemDetails
                {
                    Title = "Внутренняя ошибка",
                    Status = 500,
                    Detail = exception?.Message,
                    Instance = context.Request.Path
                };

                problemDetails.Extensions["traceId"] = context.TraceIdentifier;
                problemDetails.Extensions["exceptionType"] = exception?.GetType().Name;

                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/problem+json";
                await context.Response.WriteAsJsonAsync(problemDetails);
            });
        });

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();

            using var scope = app.Services.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            context.Database.Migrate();
        }

        app.UseStaticFiles("/api/static");

        app.UseAuthorization();

        app.MapControllers();

        app.MapHub<SolutionHub>("/solutionsHub");

        app.Run();
    }
}
