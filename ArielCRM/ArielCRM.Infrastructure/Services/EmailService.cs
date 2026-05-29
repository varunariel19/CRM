using ArielCRM.Infrastructure.Interfaces.IService;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace ArielCRM.Infrastructure.Services
{
    public class EmailService(IConfiguration config) : IEmailService
    {
        private readonly IConfiguration _configuration = config;

        public async Task SendWelcomeEmailAsync(string toEmail, string name, string password)
        {
            var message = new MimeMessage();

            message.From.Add(new MailboxAddress("ArielCRM", _configuration["Email:From"]));
            message.To.Add(new MailboxAddress(name, toEmail));
            message.Subject = "Your ArielCRM Account Credentials";

            message.Body = new TextPart("html")
            {
                Text = $@"
                    <div style=""font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;"">
                        <h2 style=""color:#0f172a;margin-bottom:4px;"">
                            Welcome to ArielCRM
                        </h2>
                        <p style=""color:#64748b;font-size:14px;"">
                            Hi {name}, your account has been created.
                        </p>
                        <div style=""background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;"">
                            <p style=""margin:0 0 8px;font-size:13px;color:#64748b;"">
                                Your login credentials:
                            </p>
                            <p style=""margin:0;font-size:14px;"">
                                <strong>Email:</strong> {toEmail}
                            </p>
                            <p style=""margin:4px 0 0;font-size:14px;"">
                                <strong>Password:</strong> {password}
                            </p>
                        </div>
                        <p style=""color:#ef4444;font-size:12px;"">
                            Please change your password after your first login.
                        </p>
                    </div>"
            };

            using var client = new SmtpClient();

            await client.ConnectAsync(
                _configuration["Email:Host"],
                int.Parse(_configuration["Email:Port"]!),
                bool.Parse(_configuration["Email:UseSsl"]!)
            );

            await client.AuthenticateAsync(
                _configuration["Email:Username"],
                _configuration["Email:Password"]
            );

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}