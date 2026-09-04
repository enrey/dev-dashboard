using System;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Analyzer.Confluence.Application.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Analyzer.Confluence.Application.Services
{
    public class ConfluenceFetcher
    {
        private ConfluenceConfig _config;

        public ConfluenceFetcher(IOptionsMonitor<ConfluenceConfig> config) {
            if (config.CurrentValue.Host == null) { throw new ArgumentNullException("confluenceConfig.Host"); }
            if (config.CurrentValue.Username == null) { throw new ArgumentNullException("confluenceConfig.Pwd"); }
            if (config.CurrentValue.Pwd == null) { throw new ArgumentNullException("confluenceConfig.Pwd"); }

            _config = config.CurrentValue;
        }

        private HttpClient GetClient()
        {
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
                Convert.ToBase64String(
                    ASCIIEncoding.ASCII.GetBytes(
                        string.Format("{0}:{1}", _config.Username, _config.Pwd))));

            return httpClient;
        }

        public async Task<string> GetContent(int id, int version)
        {
            var httpClient = GetClient();

            var query = $"{_config.Host}/rest/api/content/{id}/?version={version}&expand=body.storage";

            using (HttpResponseMessage response = await httpClient.GetAsync(query))
            {
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();

                var body = JsonConvert.DeserializeObject<dynamic>(responseBody) as JObject;
                return body.SelectToken("body.storage.value").Value<string>();
            }
        }

        public async Task<dynamic> SearchQuery(DateTimeOffset from, DateTimeOffset till, int skip, int take)
        {
// TODO + ;.space,
//      "space": {
//        "id": 3375106,
//        "key": "EXAMPLE",
//        "name": "ММЦ",
//        "type": "global",
//        "_links": {
//          "webui": "/display/EXAMPLE",
//          "self": "https://confluence.example.com/rest/api/space/EXAMPLE"
//        },
//        "_expandable": {
//          "metadata": "",
//          "icon": "",
//          "description": "",
//          "homepage": "/rest/api/content/3014829"
//        }

            var fromString = from.ToString("yyyy-MM-dd"); // 2024-09-01
            var tillString = till.ToString("yyyy-MM-dd"); // 2024-09-03
            var query = $"{_config.Host}/rest/api/content/search?cql=type in (page, attachment) AND lastmodified>=\"{fromString}\" and lastmodified<=\"{tillString}\" order by lastmodified desc&expand=history.lastUpdated&start={skip}&limit={take}";

            dynamic body = null;
            var httpClient = GetClient();
            using (HttpResponseMessage response = await httpClient.GetAsync(query))
            {
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();

                body = JsonConvert.DeserializeObject<dynamic>(responseBody);
            }

            return body;
        }

    }
}
