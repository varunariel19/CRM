using System.Security.Cryptography;

namespace ArielCRM.Shared.Utils
{
    public class Utils
    {

        private const string Lower = "abcdefghijklmnopqrstuvwxyz";
        private const string Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private const string Numbers = "0123456789";
        private const string Symbols = "!@#$%^&*";

        private static readonly string AllChars =
            Lower + Upper + Numbers + Symbols;

        public static string GeneratePassword(int length = 10)
        {
            var password = new char[length];

            for (int i = 0; i < length; i++)
            {
                int index = RandomNumberGenerator.GetInt32(AllChars.Length);
                password[i] = AllChars[index];
            }

            return new string(password);
        }
        public static string GetTenantName(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be empty");

            return email.Split('@')[1].Split('.')[0];
        }

        public static string NormalizeEmail(string email)
        {
            string[] emailParts = email.Split('@');
            if (emailParts.Length != 2)
                throw new Exception("Invalid email format.");

            string localPart = emailParts[0];
            string domainPart = emailParts[1];

            string normalizedDomain = domainPart.ToLowerInvariant() switch
            {
                "superadmin.com" => "superAdmin.com",
                _ => domainPart
            };

            return $"{localPart}@{normalizedDomain}";
        }

    }
}
