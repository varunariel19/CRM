namespace ArielCRM.Infrastructure.Interfaces.IService
{
        public interface IEmailService
        {
            Task SendWelcomeEmailAsync(string toEmail, string name, string password);
        }
}
