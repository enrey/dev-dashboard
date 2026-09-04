using Analyzer.Common.DataContracts;
using Microsoft.AspNetCore.Http;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Analyzer.Common.Infrastructure
{
    public class AnalyzerExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;

        public AnalyzerExceptionHandlerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        /// <summary>
        /// Обработка исключения
        /// </summary>
        /// <param name="context"></param>
        /// <param name="ex"></param>
        /// <returns></returns>
        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 500;
            var result = JsonSerializer.Serialize(new ErrorDto(500, ex.Message, ex.StackTrace));

            await context.Response.WriteAsync(result);
        }
    }
}
