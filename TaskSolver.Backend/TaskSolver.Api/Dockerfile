FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["TaskSolver.Api/TaskSolver.Api.csproj", "TaskSolver.Api/"]
COPY ["TaskSolver.Infrastructure/TaskSolver.Infrastructure.csproj", "TaskSolver.Infrastructure/"]
COPY ["TaskSolver.Infrastructure.Persistense/TaskSolver.Infrastructure.Persistense.csproj", "TaskSolver.Infrastructure.Persistense/"]
COPY ["TaskSolver.Core.Application/TaskSolver.Core.Application.csproj", "TaskSolver.Core.Application/"]
COPY ["TaskSolver.Core.Domain/TaskSolver.Core.Domain.csproj", "TaskSolver.Core.Domain/"]
RUN dotnet restore "./TaskSolver.Api/TaskSolver.Api.csproj"
COPY . .
WORKDIR "/src/TaskSolver.Api"
RUN dotnet build "./TaskSolver.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./TaskSolver.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskSolver.Api.dll"]