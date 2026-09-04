using Analyzer.Common.Infrastructure;
using Analyzer.Jira.Application.Configuration;
using Analyzer.Jira.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JiraAnalyzer.Web.Api
{
    /// <summary> Конфигуратор сервисов приложения </summary>
    public static class ServicesConfigurator
    {
        private const string JIRA_CONFIG = "JiraConfig";
        private const string ELASTIC_CONFIG = "ElasticSearch";

        /// <summary> Регистрация бизнесовых сервисов </summary>
        public static void RegisterServices(this IServiceCollection services, ConfigurationManager configuration)
        {
            services.Configure<JiraConfig>(configuration.GetSection(JIRA_CONFIG));
            services.Configure<ElasticConfig>(configuration.GetSection(ELASTIC_CONFIG));

            services.AddTransient<JiraService>();
            services.AddTransient<JiraElasticService>();
            services.AddTransient<JiraLoader>();
        }
    }
}
