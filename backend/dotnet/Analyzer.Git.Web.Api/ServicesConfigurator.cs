using Analyzer.Common.Infrastructure;
using Analyzer.Git.Application.Configuration;
using Analyzer.Git.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Analyzer.Git.Web.Api
{
    /// <summary> Конфигуратор сервисов приложения </summary>
    public static class ServicesConfigurator
    {
        private const string ELASTIC_CONFIG = "ElasticSearch";
        private const string REPO_CONFIG = "Repositories";
        private const string ANALYZER_GITLAB_CONFIG = "LocalServices";

        /// <summary> Регистрация бизнесовых сервисов </summary>
        public static void RegisterServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<ElasticConfig>(configuration.GetSection(ELASTIC_CONFIG));
            services.Configure<RepositoriesConfig>(configuration.GetSection(REPO_CONFIG));
            services.Configure<LocalServicesConfig>(configuration.GetSection(ANALYZER_GITLAB_CONFIG));

            services.AddTransient<GitElasticService>();
            services.AddTransient<IGitlabServiceClient, GitlabServiceClient>();
            services.AddTransient<IGitStatisticsService, GitStatisticsService>();
        }
    }
}
