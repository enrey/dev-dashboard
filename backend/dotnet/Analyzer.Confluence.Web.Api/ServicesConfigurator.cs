using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Analyzer.Confluence.Application.Configuration;
using Analyzer.Confluence.Application.Services;
using Analyzer.Common.Infrastructure;

namespace Analyzer.Confluence.Web.Api
{
    /// <summary> Конфигуратор сервисов приложения </summary>
    public static class ServicesConfigurator
    {
        private const string CONFLUENCE_CONFIG = "ConfluenceConfig";
        private const string ELASTIC_CONFIG = "ElasticSearch";

        /// <summary> Регистрация бизнесовых сервисов </summary>
        public static void RegisterServices(this IServiceCollection services, ConfigurationManager configuration)
        {
            services.Configure<ConfluenceConfig>(configuration.GetSection(CONFLUENCE_CONFIG));
            services.Configure<ElasticConfig>(configuration.GetSection(ELASTIC_CONFIG));

            services.AddTransient<ConfluenceService>();
            services.AddTransient<ConfluenceFetcher>();
            services.AddTransient<ConflueceElasticService>();
        }
    }
}
