# syntax=docker/dockerfile:1.7
#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY . .
WORKDIR "/src/Analyzer.BackgroundJobs.Server"
RUN --mount=type=cache,target=/root/.nuget/packages dotnet restore "Analyzer.BackgroundJobs.Server.csproj"
RUN --mount=type=cache,target=/root/.nuget/packages dotnet build "Analyzer.BackgroundJobs.Server.csproj" -c Release --no-restore -o /app/build

FROM build AS publish
RUN --mount=type=cache,target=/root/.nuget/packages dotnet publish "Analyzer.BackgroundJobs.Server.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Analyzer.BackgroundJobs.Server.dll"]
