using System.Collections.Concurrent;
using System.Security.Claims;
using ArielCRM.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Application.Hubs
{
    [Authorize]
    public class TeamsHub(AppDbContext db) : Hub
    {

        private string UserId => Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _userSockets = new();

        public override async Task OnConnectedAsync()
        {
            var sockets = _userSockets.GetOrAdd(UserId, _ => new ConcurrentDictionary<string, byte>());
            var wasOffline = sockets.IsEmpty;
            sockets.TryAdd(Context.ConnectionId, 0);

            var conversationIds = await db.TeamConversations
                .Where(c => c.Members.Contains(UserId))
                .Select(c => c.Id)
                .ToListAsync();

            foreach (var conversationId in conversationIds)
                await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);

            await Clients.Caller.SendAsync("OnlineUsersSnapshot", _userSockets.Keys.ToArray());
            if (wasOffline) await Clients.All.SendAsync("UserPresenceChanged", UserId, true);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_userSockets.TryGetValue(UserId, out var sockets))
            {
                sockets.TryRemove(Context.ConnectionId, out _);
                if (sockets.IsEmpty)
                {
                    _userSockets.TryRemove(UserId, out _);
                    await Clients.All.SendAsync("UserPresenceChanged", UserId, false);
                }
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

        private Task<bool> IsMember(string conversationId) => db.TeamConversations
            .AnyAsync(c => c.Id == conversationId && c.Members.Contains(UserId));
    }
}
