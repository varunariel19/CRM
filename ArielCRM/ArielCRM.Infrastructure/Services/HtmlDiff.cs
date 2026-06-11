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
            catch { return null; }

            if (prev is null || next is null) return null;

            var diff = new Dictionary<string, object>();

            foreach (var key in next.Keys)
            {
                if (IsSystemField(key)) continue;

                var newVal = Stringify(next[key]);
                var oldVal = prev.TryGetValue(key, out var ov) ? Stringify(ov) : null;

                // Only record if the value actually changed
                if (newVal == oldVal) continue;

                diff[key] = new
                {
                    from = oldVal,
                    to = newVal
                };
            }

            // Also capture fields that were removed (exist in prev but not in next)
            foreach (var key in prev.Keys)
            {
                if (IsSystemField(key)) continue;
                if (next.ContainsKey(key)) continue; // already handled above

                diff[key] = new
                {
                    from = Stringify(prev[key]),
                    to = (string?)null
                };
            }

            return diff.Count == 0 ? null : JsonSerializer.Serialize(diff);
        }

        private static string Stringify(JsonElement el)
        {
            return el.ValueKind switch
            {
                JsonValueKind.String => el.GetString() ?? string.Empty,
                JsonValueKind.Null => "null",
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                JsonValueKind.Number => el.GetRawText(),   // ← use raw text, not ToString()
                                                           // For objects/arrays: re-serialize with sorted keys for stable comparison
                _ => JsonSerializer.Serialize(
                        JsonSerializer.Deserialize<JsonElement>(el.GetRawText()),
                        new JsonSerializerOptions { WriteIndented = false })
            };
        }
        private static bool IsSystemField(string key) => _systemFields.Contains(key);
    }

}