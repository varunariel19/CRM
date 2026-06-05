using System.Text;
using System.Text.Json;

namespace ArielCRM.Infrastructure.Services
{
    public static class HtmlDiffHelper
    {
        private static readonly HashSet<string> _systemFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "id", "createdAt", "created_at", "updatedAt", "updated_at",
        "initiatedAt", "initiated_at"
    };

        public static string? GenerateDiff(string? previousJson, string? updatedJson)
        {
            if (string.IsNullOrWhiteSpace(previousJson) || string.IsNullOrWhiteSpace(updatedJson))
                return null;

            Dictionary<string, JsonElement>? prev;
            Dictionary<string, JsonElement>? next;
            try
            {
                prev = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(previousJson);
                next = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(updatedJson);
            }
            catch
            {
                return null;
            }

            if (prev is null || next is null) return null;

            var diff = new Dictionary<string, object?>();

            foreach (var key in next.Keys)
            {
                if (IsSystemField(key)) continue;

                var newVal = Stringify(next[key]);

                if (string.IsNullOrEmpty(newVal) || newVal == "null") continue;

                var oldVal = prev.TryGetValue(key, out var ov) ? Stringify(ov) : null;

                if (newVal == oldVal) continue;

                diff[key] = newVal;
            }

            if (diff.Count == 0) return null;

            return JsonSerializer.Serialize(diff);
        }

        private static string Stringify(JsonElement el) => el.ValueKind switch
        {
            JsonValueKind.String => el.GetString() ?? string.Empty,
            JsonValueKind.Null => "null",
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => el.ToString()
        };

        private static bool IsSystemField(string key) => _systemFields.Contains(key);
    }

}