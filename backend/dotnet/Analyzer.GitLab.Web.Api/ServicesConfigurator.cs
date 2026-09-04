using Analyzer.Common.Infrastructure;
using Analyzer.Gitlab.Application.Configuration;
using Analyzer.Gitlab.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Analyzer.GitLab.Web.Api
{
    /// <summary> Конфигуратор сервисов приложения </summary>
    public static class ServicesConfigurator
    {
        private const string GITLAB_CONFIG = "GitLab";
        private const string ELASTIC_CONFIG = "ElasticSearch";

        /// <summary> Регистрация бизнесовых сервисов </summary>
        public static void RegisterServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<GitLabConfig>(configuration.GetSection(GITLAB_CONFIG));
            services.Configure<ElasticConfig>(configuration.GetSection(ELASTIC_CONFIG));

            services.AddTransient<IGitLabService, GitLabService>();
            services.AddTransient<GitLabElasticService>();
        }
    }
}
