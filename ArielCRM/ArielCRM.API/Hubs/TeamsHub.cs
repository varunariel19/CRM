using System.Collections.Concurrent;
using System.Security.Claims;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.API.Hubs
{
    [Authorize]
    public class TeamsHub(AppDbContext db) : Hub
    {
        private string UserId => Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        private static readonly ConcurrentDictionary<string, int> _onlineCounts = new();

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"[TeamsHub] OnConnectedAsync — UserId: {UserId}, ConnectionId: {Context.ConnectionId}");
            Console.WriteLine($"[TeamsHub] Current online users BEFORE update: {string.Join(",", _onlineCounts.Keys)}");

            var conversationIds = await db.TeamConversationMembers
                .Where(m => m.UserId == UserId)
                .Select(m => m.ConversationId)
                .ToListAsync();

            foreach (var conversationId in conversationIds)
                await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);

            await Clients.Caller.SendAsync("OnlineUsersSnapshot", _onlineCounts.Keys.ToArray());
            Console.WriteLine($"[TeamsHub] Sent snapshot to {UserId}: {string.Join(",", _onlineCounts.Keys)}");

            var newCount = _onlineCounts.AddOrUpdate(UserId, 1, (_, count) => count + 1);
            Console.WriteLine($"[TeamsHub] {UserId} connection count now: {newCount}");
            if (newCount == 1)
            {
                await Clients.All.SendAsync("UserPresenceChanged", UserId, true);
                Console.WriteLine($"[TeamsHub] Broadcasted UserPresenceChanged({UserId}, true)");
            }

            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var newCount = _onlineCounts.AddOrUpdate(UserId, 0, (_, count) => Math.Max(0, count - 1));
            if (newCount == 0)
            {
                _onlineCounts.TryRemove(UserId, out _);
                await Clients.All.SendAsync("UserPresenceChanged", UserId, false);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(string conversationId)
        {
            if (await IsMember(conversationId))
                await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(string conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task SendTyping(string conversationId, bool isTyping)
        {
            if (!await IsMember(conversationId)) return;

            var name = Context.User?.FindFirstValue(ClaimTypes.Name) ?? "Someone";
            await Clients.OthersInGroup(conversationId).SendAsync("TypingChanged", conversationId, UserId, name, isTyping);
        }

        public async Task SendCallSignal(TeamCallSignalDto dto)
        {
            if (!await IsMember(dto.ConversationId)) return;

            await Clients.OthersInGroup(dto.ConversationId).SendAsync(
                "CallSignalReceived",
                dto.ConversationId,
                UserId,
                Context.User?.FindFirstValue(ClaimTypes.Name) ?? "Unknown",
                dto.CallId,
                dto.CallType,
                dto.SignalType,
                dto.Payload);
        }

        private Task<bool> IsMember(string conversationId) => db.TeamConversationMembers
            .AnyAsync(m => m.ConversationId == conversationId && m.UserId == UserId);
    }
}