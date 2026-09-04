using System;
using System.Runtime.Serialization;

namespace Analyser.BackgroundJobs.Application.Exceptions
{
    [Serializable]
    public class DashboardException : Exception
    {
        public DashboardException(string message)
            : base(message) { }

        protected DashboardException(SerializationInfo info, StreamingContext context)
            : base(info, context) { }
    }
}
