using Analyser.BackgroundJobs.Application.Jobs;
using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Analyser.BackgroundJobs.Application.Services;
using Hangfire;
using Hangfire.Common;
using Hangfire.Storage;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Refit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Analyser.BackgroundJobs.Server.Jobs
{
    public static class RegistrationExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddRefitClient<IJiraClient>()
                .ConfigureHttpClient(c => {
                    c.BaseAddress = new Uri(configuration.GetValue<string>("Services:Jira:Url"));
                    c.Timeout = TimeSpan.FromMinutes(10);
                });

            services.AddRefitClient<IConfluenceClient>()
                .ConfigureHttpClient(c => {
                    c.BaseAddress = new Uri(configuration.GetValue<string>("Services:Confluence:Url"));
                    c.Timeout = TimeSpan.FromMinutes(10);
                });

            services.AddRefitClient<IGitClient>()
               .ConfigureHttpClient(c => { 
                   c.BaseAddress = new Uri(configuration.GetValue<string>("Services:Git:Url"));
                   c.Timeout = TimeSpan.FromMinutes(20);
               });

            services.AddRefitClient<IGitLabClient>()
               .ConfigureHttpClient(c => { 
                   c.BaseAddress = new Uri(configuration.GetValue<string>("Services:GitLab:Url"));
                   c.Timeout = TimeSpan.FromMinutes(10);
               });

            services.AddScoped<IUpdateStatusService, UpdateStatusService>();

            return services;
        }

        public static IApplicationBuilder AddPredefinedJobs(this IApplicationBuilder app, IConfiguration configuration)
        {
            var baseType = typeof(RecurringJobMetadataBase);

            var asm = baseType.Assembly;

            var types = asm.GetTypes().Where(x => baseType.IsAssignableFrom(x) && !x.IsAbstract);

            var manager = new RecurringJobManager();

            var activeJobs = new List<string>();

            foreach (var type in types)
            {
                var info = (RecurringJobMetadataBase)Activator.CreateInstance(type);

                _ = info ?? throw new NullReferenceException(nameof(info));

                var runMethod = info.RunnerType.GetMethod(
                    nameof(IRecurringJobRunner.Execute),
                    BindingFlags.Instance | BindingFlags.Public);

                var job = new Job(info.RunnerType, runMethod);

                activeJobs.Add(info.Id);

                manager.AddOrUpdate(info.Id, job, configuration.GetValue<string>($"Services:{info.Name}:Cron"));
            }

            using var connection = JobStorage.Current.GetConnection();
            foreach (var job in connection.GetRecurringJobs().Where(job => !activeJobs.Contains(job.Id)))
                RecurringJob.RemoveIfExists(job.Id);

            return app;
        }
    }
}
