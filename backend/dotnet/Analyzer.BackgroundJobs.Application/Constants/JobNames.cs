using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Analyser.BackgroundJobs.Application.Constants
{
    public static class JobNames
    {
        public const string Jira = nameof(Jira);

        public const string Git = nameof(Git);

        public const string GitRepos = nameof(GitRepos);

        public const string GitLab = nameof(GitLab);

        public const string Confluence = nameof(Confluence);

        public static List<string> GetAll()
        {
            return typeof(JobNames).GetFields(BindingFlags.Public | BindingFlags.Static |
               BindingFlags.FlattenHierarchy)
                .Where(fi => fi.IsLiteral && !fi.IsInitOnly)
                .Select(fi => fi.Name).ToList();
        }
    }
}
