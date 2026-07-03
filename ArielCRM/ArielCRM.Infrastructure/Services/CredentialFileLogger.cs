using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace ArielCRM.Infrastructure.Services
{

    public class CredentialLogEntry
    {
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CredentialFileLogger(IConfiguration config)
    {
        private readonly string _filePath = config["CredentialLog:FilePath"] ?? "credentials_log.json";
        private static readonly SemaphoreSlim _lock = new(1, 1);

        public async Task AppendAsync(CredentialLogEntry entry)
        {
            await _lock.WaitAsync();
            try
            {
                List<CredentialLogEntry> records = new();

                if (File.Exists(_filePath))
                {
                    var existingJson = await File.ReadAllTextAsync(_filePath);
                    if (!string.IsNullOrWhiteSpace(existingJson))
                    {
                        records = JsonSerializer.Deserialize<List<CredentialLogEntry>>(existingJson) ?? new();
                    }
                }

                records.Add(entry);

                var options = new JsonSerializerOptions { WriteIndented = true };
                var updatedJson = JsonSerializer.Serialize(records, options);

                await File.WriteAllTextAsync(_filePath, updatedJson);
            }
            finally
            {
                _lock.Release();
            }
        }
    }

}