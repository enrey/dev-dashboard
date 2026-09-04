using Analyser.BackgroundJobs.Server.Jobs;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;
using System;

namespace Analyser.BackgroundJobs.Server
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var connectionString = Configuration.GetConnectionString("Redis");
            services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(connectionString));
            services.AddHangfire(configuration => configuration.UseRedisStorage(Configuration.GetConnectionString("Redis")));
            services.AddHangfireServer();
            services.AddServices(Configuration);
            services.AddRazorPages();
            services.AddControllers();
            services.AddCors();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var readOnlyMode = Configuration.GetValue<bool>("ReadOnlyMode");
            if (readOnlyMode)
                Console.WriteLine("Данные источников не заданы, поэтому сервис запущен только в readonly-режиме для отдачи данных.");

            app.UseDeveloperExceptionPage();

            app.UseCors(options =>
                options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

            app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = new[] { new HangFireAuthorizationFilter() },
            });

            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
                endpoints.MapControllers();
                endpoints.MapHangfireDashboard();
            });

            if (!readOnlyMode)
                app.AddPredefinedJobs(Configuration);
        }
    }
}
