#pragma warning disable CS1591
using Analyzer.Common.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using System;
using System.IO;
using System.Reflection;

namespace Analyzer.Git.Web.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Logging.ClearProviders();
            builder.Logging.AddConsole(o => o.TimestampFormat = "yyyy-MM-dd HH:mm:ss.F ");

            ConfigureServices(builder.Services, builder.Configuration);

            Console.WriteLine($"Application Name: {builder.Environment.ApplicationName}");
            Console.WriteLine($"Environment Name: {builder.Environment.EnvironmentName}");
            WriteReadOnlyModeMessage(builder.Configuration);

            var app = builder.Build();
            ConfigureApp(app);
            app.Run();
        }

        private static void ConfigureServices(IServiceCollection services, ConfigurationManager configuration)
        {
            services.AddControllers();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Git analyzer API", Version = "v1" });

                var xmlPath = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
                c.IncludeXmlComments(xmlPath);
            });

            services.AddMemoryCache();
            services.AddCors();

            ServicesConfigurator.RegisterServices(services, configuration);
        }

        private static void ConfigureApp(WebApplication app)
        {
            ConfigureReadOnlyMode(app);
            app.UseMiddleware<AnalyzerExceptionHandlerMiddleware>();

            app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Git analyzer API V1");
            });

            app.MapControllers();
        }

        private static void WriteReadOnlyModeMessage(IConfiguration configuration)
        {
            if (configuration.GetValue<bool>("ReadOnlyMode"))
                Console.WriteLine("Данные источников не заданы, поэтому сервис запущен только в readonly-режиме для отдачи данных.");
        }

        private static void ConfigureReadOnlyMode(WebApplication app)
        {
            if (!app.Configuration.GetValue<bool>("ReadOnlyMode")) return;

            app.Use(async (context, next) =>
            {
                if (!HttpMethods.IsGet(context.Request.Method) || context.Request.Path.Value?.Contains("update-", StringComparison.OrdinalIgnoreCase) == true)
                {
                    context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
                    await context.Response.WriteAsync("Read-only mode");
                    return;
                }

                await next();
            });
        }
    }
}
#pragma warning restore CS1591
