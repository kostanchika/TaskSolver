using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.OpenApi;
using MitMediator;
using Serilog;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using TaskSolver.Api.Hosting;
using TaskSolver.Core.Application.Common;
using TaskSolver.Core.Application.Consulting.Interfaces;
using TaskSolver.Core.Application.Users.Commands;
using TaskSolver.Core.Application.Users.DTOs;
using TaskSolver.Core.Domain.Abstractions.Results;
using TaskSolver.Infrastructure.Common.Events;
using TaskSolver.Infrastructure.Consulting;

namespace TaskSolver.Api.Extensions;

public static class DependencyInjectionExtensions
{
    public static void ConfigureLogger(this WebApplicationBuilder builder)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
            .MinimumLevel.Override("System.Net.Http.HttpClient", Serilog.Events.LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            .WriteTo.File(
                "Logs/log-.txt",
                rollingInterval: RollingInterval.Day,
                outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            .Enrich.FromLogContext()
            .CreateLogger();

        builder.Host.UseSerilog();
    }

    public static void AddSwaggerAuth(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "TaskSolver.Backend", Version = "v1" });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer"
            });

            c.AddSecurityRequirement(document =>
                new() { [new OpenApiSecuritySchemeReference("Bearer", document)] = [] });
        });
    }

    public static AuthenticationBuilder AddGithubOAuth(this AuthenticationBuilder builder, IConfiguration configuration)
    {
        return builder.AddOAuth("GitHub", options =>
         {
             options.ClientId = configuration["GitHub:ClientId"];
             options.ClientSecret = configuration["GitHub:ClientSecret"];
             options.CallbackPath = "/signin-github";
             options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
             options.TokenEndpoint = "https://github.com/login/oauth/access_token";
             options.UserInformationEndpoint = "https://api.github.com/user";
             options.SaveTokens = true;
             options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
             options.ClaimActions.MapJsonKey(ClaimTypes.Name, "login");
             options.Scope.Add("user:email");
             options.Events = new OAuthEvents
             {
                 OnRedirectToAuthorizationEndpoint = context =>
                 {
                     Console.WriteLine("Redirect " + context.RedirectUri);

                     context.Response.Redirect(context.RedirectUri);

                     return Task.CompletedTask;
                 },
                 OnTicketReceived = async context =>
                 {
                     var githubId = context.Properties!.Items["githubId"]!;
                     var email = context.Properties!.Items["email"]!;

                     var db = context.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();
                     var mediator = context.HttpContext.RequestServices.GetRequiredService<IMediator>();

                     var userExists = await db.Users.ExistsByExternalAuthAsync("github", githubId);

                     Result<AuthResponseDto> authResponseDtoResult;

                     if (userExists)
                     {
                         authResponseDtoResult = await mediator.SendAsync<LoginViaExternalAccountCommand, Result<AuthResponseDto>>(
                             new LoginViaExternalAccountCommand("github", githubId),
                             default);
                     }
                     else
                     {
                         authResponseDtoResult = await mediator.SendAsync<RegisterViaExternalAccountCommand, Result<AuthResponseDto>>(
                             new RegisterViaExternalAccountCommand(
                                 "github",
                                 githubId,
                                 email),
                             default);
                     }


                     var redirectUrl = $"http://localhost:5173/auth/success?accessToken={authResponseDtoResult.Value.AccessToken}&refreshToken={authResponseDtoResult.Value.RefreshToken}&userId={authResponseDtoResult.Value.UserId}&role={authResponseDtoResult.Value.Role}";
                     context.Response.Redirect(redirectUrl);

                     context.HandleResponse();
                 },
                 OnCreatingTicket = async context =>
                 {
                     var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
                     request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                     request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);

                     var response = await context.Backchannel.SendAsync(request);
                     var userJson = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

                     context.RunClaimActions(userJson.RootElement);

                     var githubId = userJson.RootElement.GetProperty("id").GetInt64().ToString();

                     var emailRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/emails");
                     emailRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                     emailRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);

                     var emailResponse = await context.Backchannel.SendAsync(emailRequest);
                     var emailJson = JsonDocument.Parse(await emailResponse.Content.ReadAsStringAsync());

                     var email = emailJson.RootElement
                         .EnumerateArray()
                         .FirstOrDefault(e => e.GetProperty("primary").GetBoolean())
                         .GetProperty("email").GetString();

                     if (!string.IsNullOrEmpty(email))
                     {
                         context.Identity?.AddClaim(new Claim(ClaimTypes.Email, email));
                     }

                     context.Properties.Items["githubId"] = githubId;
                     context.Properties.Items["email"] = email;
                 }
             };
         });
    }

    public static AuthenticationBuilder AddGoogleOAuth(this AuthenticationBuilder builder, IConfiguration configuration)
    {
        return builder.AddGoogle("Google", options =>
         {
             options.ClientId = configuration["Google:ClientId"];
             options.ClientSecret = configuration["Google:ClientSecret"];
             options.CallbackPath = new PathString("/signin-google");

             options.SaveTokens = true;

             options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "sub");
             options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
             options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
             options.ClaimActions.MapJsonKey("urn:google:picture", "picture");

             options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;

             options.Events = new OAuthEvents
             {
                 OnTicketReceived = async context =>
                 {
                     var googleId = context.Principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                     var email = context.Principal.FindFirst(ClaimTypes.Email)?.Value!;

                     var db = context.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();
                     var mediator = context.HttpContext.RequestServices.GetRequiredService<IMediator>();

                     var userExists = await db.Users.ExistsByExternalAuthAsync("google", googleId);

                     Result<AuthResponseDto> authResponseDtoResult;

                     if (userExists)
                     {
                         authResponseDtoResult = await mediator.SendAsync<LoginViaExternalAccountCommand, Result<AuthResponseDto>>(
                             new LoginViaExternalAccountCommand("google", googleId),
                             default);
                     }
                     else
                     {
                         authResponseDtoResult = await mediator.SendAsync<RegisterViaExternalAccountCommand, Result<AuthResponseDto>>(
                             new RegisterViaExternalAccountCommand(
                                 "google",
                                 googleId,
                                 email),
                             default);
                     }


                     var redirectUrl = $"https://tasksolver.com/auth/success?accessToken={authResponseDtoResult.Value.AccessToken}&refreshToken={authResponseDtoResult.Value.RefreshToken}&userId={authResponseDtoResult.Value.UserId}&role={authResponseDtoResult.Value.Role}";
                     context.Response.Redirect(redirectUrl);

                     context.HandleResponse();
                 },
             };
         });
    }

    public static IServiceCollection HostEvents(this IServiceCollection services)
    {
        return services.AddHostedService(sp =>
            new BackgroundServiceWrapper(ct => sp.GetRequiredService<EventDispatcher>().StartAsync(ct)));
    }

    public static IServiceCollection AddMistralHttpClient(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient("mistral", client =>
        {
            client.BaseAddress = new Uri("https://api.mistral.ai/");
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", configuration["Mistral:ApiKey"]);
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }

    public static IServiceCollection AddCodeRunnerHttpClient(this IServiceCollection services, IConfiguration configuration)
    {
        var codeRunnerUrl = configuration["CodeRunner:Url"]
            ?? throw new NullReferenceException("codeRunnerUrl is null");
        services.AddHttpClient("coderunner", client =>
        {
            client.BaseAddress = new Uri(codeRunnerUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}
