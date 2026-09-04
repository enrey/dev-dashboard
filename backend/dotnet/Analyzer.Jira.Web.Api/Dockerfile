# syntax=docker/dockerfile:1.7
#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS publish
WORKDIR /src
COPY  ./ ./

WORKDIR /src/Analyzer.Jira.Web.Api
RUN --mount=type=cache,target=/root/.nuget/packages dotnet restore "Analyzer.Jira.Web.Api.csproj"
RUN --mount=type=cache,target=/root/.nuget/packages dotnet publish "Analyzer.Jira.Web.Api.csproj" -c Debug --no-restore -o /app/publish

FROM base AS finalJira
WORKDIR /app
COPY --from=publish /app/publish .

ENV DOTNET_CLI_TELEMETRY_OPTOUT=1

ENTRYPOINT ["dotnet", "Analyzer.Jira.Web.Api.dll"]
