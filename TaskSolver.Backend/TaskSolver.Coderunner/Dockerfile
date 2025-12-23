FROM mcr.microsoft.com/dotnet/sdk:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["TaskSolver.Coderunner/TaskSolver.Coderunner.csproj", "TaskSolver.Coderunner/"]
RUN dotnet restore "./TaskSolver.Coderunner/TaskSolver.Coderunner.csproj"
COPY . .
WORKDIR "/src/TaskSolver.Coderunner"
RUN dotnet build "./TaskSolver.Coderunner.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./TaskSolver.Coderunner.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

USER root
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

USER $APP_UID

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskSolver.Coderunner.dll"]
