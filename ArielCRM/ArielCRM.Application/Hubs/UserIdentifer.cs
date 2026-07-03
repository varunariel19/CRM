using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace ArielCRM.API.Hubs
{
    public class NameIdentifierUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection) =>
            connection.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    }

}