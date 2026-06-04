using System.Text;
using System.Text.Json;

namespace ArielCRM.Infrastructure.Services
{
        public static class HtmlDiffHelper
        {
            private const string OldStyle = "color:#c0392b;text-decoration:line-through;font-family:monospace";
            private const string NewStyle = "color:#27ae60;font-family:monospace";
            private const string LabelStyle = "font-weight:600;padding:4px 10px 4px 4px;white-space:nowrap;vertical-align:top";
            private const string CellStyle = "padding:4px 8px;vertical-align:top";

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

                var rows = new StringBuilder();
                var allKeys = prev.Keys.Union(next.Keys).OrderBy(k => k);

                foreach (var key in allKeys)
                {
                    var oldVal = prev.TryGetValue(key, out var ov) ? Stringify(ov) : null;
                    var newVal = next.TryGetValue(key, out var nv) ? Stringify(nv) : null;

                    if (IsSystemField(key)) continue;

                    if (oldVal == newVal) continue;

                    var oldHtml = oldVal is not null
                        ? $"<span style=\"{OldStyle}\">{Escape(oldVal)}</span>"
                        : "<em style=\"color:#999\">—</em>";

                    var newHtml = newVal is not null
                        ? $"<span style=\"{NewStyle}\">{Escape(newVal)}</span>"
                        : "<em style=\"color:#999\">—</em>";

                    rows.AppendLine($"""
                    <tr>
                      <td style="{LabelStyle}">{Escape(ToLabel(key))}</td>
                      <td style="{CellStyle}">{oldHtml}</td>
                      <td style="{CellStyle}">→</td>
                      <td style="{CellStyle}">{newHtml}</td>
                    </tr>
                    """);
                }

                if (rows.Length == 0) return null;

                return $"""
                <table style="border-collapse:collapse;font-size:13px;width:100%">
                  <thead>
                    <tr style="background:#f5f5f5">
                      <th style="{LabelStyle}">Field</th>
                      <th style="{CellStyle}">Previous</th>
                      <th style="{CellStyle}"></th>
                      <th style="{CellStyle}">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows}
                  </tbody>
                </table>
                """;
            }

            private static string Stringify(JsonElement el) => el.ValueKind switch
            {
                JsonValueKind.String => el.GetString() ?? string.Empty,
                JsonValueKind.Null => "null",
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                _ => el.ToString()
            };

            private static string Escape(string s)
                => s.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;");

            private static string ToLabel(string key)
            {
                var spaced = key.Replace('_', ' ');
                var result = System.Text.RegularExpressions.Regex.Replace(spaced, "([a-z])([A-Z])", "$1 $2");
                return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(result.ToLower());
            }

            private static readonly HashSet<string> _systemFields = new(StringComparer.OrdinalIgnoreCase)
        {
            "id", "createdAt", "created_at", "updatedAt", "updated_at",
            "initiatedAt", "initiated_at"
        };

            private static bool IsSystemField(string key) => _systemFields.Contains(key);
        }
}
