using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
        public class HistoryService(IHistoryRepository repo, AppDbContext db , IHttpContextAccessor httpContext) : IHistoryService
        {
            private readonly IHistoryRepository _repo = repo;
            private readonly AppDbContext _db = db;
        private readonly IHttpContextAccessor _httpContext = httpContext;

            private static readonly JsonSerializerOptions _jsonOpts = new()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

        public async Task LogAsync(LogHistoryRequest request)
            {
                string? modifiedData = null;

            var userId = _httpContext.HttpContext?.User?
                         .FindFirst(ClaimTypes.NameIdentifier)?.Value;


            if (request.ActionType == CRMActionType.Update)
                    modifiedData = HtmlDiffHelper.GenerateDiff(request.PreviousState, request.UpdatedState);

                var revertType = request.ActionType switch
                {
                    CRMActionType.Create => CRMRevertType.Delete,
                    CRMActionType.Delete => CRMRevertType.Create,
                    CRMActionType.Update => CRMRevertType.Update,
                    _ => CRMRevertType.None
                };

                var history = new CRMHistory
                {
                    EntityName = request.EntityName,
                    EntityId = request.EntityId,
                    Title = request.Title,
                    ActionType = request.ActionType,
                    RevertType = revertType,
                    ModifiedData = modifiedData,
                    PreviousState = request.PreviousState,
                    UpdatedState = request.UpdatedState,
                    InitiatedById = userId!,
                    InitiatedAt = DateTime.UtcNow
                };

                await _repo.AddAsync(history);
                await _repo.SaveChangesAsync();
            }


            public async Task<PaginatedHistoryDto> GetAllAsync(HistoryFilterDto filter)
            {
                var (items, total) = await _repo.GetAllAsync(filter);
                return new PaginatedHistoryDto
                {
                    Items = items.Select(Map),
                    TotalCount = total,
                    Page = filter.Page,
                    PageSize = filter.PageSize
                };
            }

            public async Task<IEnumerable<HistoryResponseDto>> GetByEntityAsync(string entityName, string entityId)
            {
                var items = await _repo.GetByEntityAsync(entityName, entityId);
                return items.Select(Map);
            }

            public async Task<HistoryResponseDto?> GetByIdAsync(string id)
            {
                var item = await _repo.GetByIdAsync(id);
                return item is null ? null : Map(item);
            }

            public async Task<HistoryResponseDto> CreateManualAsync(CreateHistoryDto dto, string initiatedById)
            {
                string? modifiedData = null;
                if (dto.ActionType == CRMActionType.Update)
                    modifiedData = HtmlDiffHelper.GenerateDiff(dto.PreviousState, dto.UpdatedState);

                var revertType = dto.ActionType switch
                {
                    CRMActionType.Create => CRMRevertType.Delete,
                    CRMActionType.Delete => CRMRevertType.Create,
                    CRMActionType.Update => CRMRevertType.Update,
                    _ => CRMRevertType.None
                };

                var history = new CRMHistory
                {
                    EntityName = dto.EntityName,
                    EntityId = dto.EntityId,
                    Title = dto.Title,
                    ActionType = dto.ActionType,
                    RevertType = revertType,
                    ModifiedData = modifiedData ?? dto.ModifiedData,
                    PreviousState = dto.PreviousState,
                    UpdatedState = dto.UpdatedState,
                    InitiatedById = initiatedById,
                    InitiatedAt = DateTime.UtcNow
                };

                await _repo.AddAsync(history);
                await _repo.SaveChangesAsync();
                return Map(history);
            }

            public async Task DeleteAsync(string id)
            {
                var history = await _repo.GetByIdAsync(id)
                    ?? throw new KeyNotFoundException($"History entry '{id}' not found.");
                await _repo.DeleteAsync(history);
                await _repo.SaveChangesAsync();
            }

            public async Task DeleteAllAsync()
            {
                await _repo.DeleteAllAsync();
            }


            public async Task RevertAsync(string historyId, string initiatedById)
            {
                var log = await _repo.GetByIdAsync(historyId)
                    ?? throw new KeyNotFoundException($"History entry '{historyId}' not found.");

                switch (log.ActionType)
                {
                    case CRMActionType.Create:
                        await RevertCreate(log, initiatedById);
                        break;

                    case CRMActionType.Delete:
                        await RevertDelete(log, initiatedById);
                        break;

                    case CRMActionType.Update:
                        await RevertUpdate(log, initiatedById);
                        break;
                }
            }

           
            private async Task RevertCreate(CRMHistory log, string initiatedById)
            {
                await DeleteEntityByNameAsync(log.EntityName, log.EntityId);

                await LogAsync(new LogHistoryRequest
                {
                    EntityName = log.EntityName,
                    EntityId = log.EntityId,
                    Title = $"Reverted: deleted {log.EntityName} '{log.EntityId}' (undid CREATE)",
                    ActionType = CRMActionType.Delete,
                    PreviousState = log.UpdatedState
                });
            }

            private async Task RevertDelete(CRMHistory log, string initiatedById)
            {
                if (string.IsNullOrWhiteSpace(log.PreviousState))
                    throw new InvalidOperationException("Cannot revert DELETE: PreviousState snapshot is missing.");

                await RestoreEntityByNameAsync(log.EntityName, log.PreviousState);

                await LogAsync(new LogHistoryRequest
                {
                    EntityName = log.EntityName,
                    EntityId = log.EntityId,
                    Title = $"Reverted: re-created {log.EntityName} '{log.EntityId}' (undid DELETE)",
                    ActionType = CRMActionType.Create,
                    UpdatedState = log.PreviousState
                });
            }

            private async Task RevertUpdate(CRMHistory log, string initiatedById)
            {
                if (string.IsNullOrWhiteSpace(log.PreviousState))
                    throw new InvalidOperationException("Cannot revert UPDATE: PreviousState snapshot is missing.");

                await PatchEntityByNameAsync(log.EntityName, log.EntityId, log.PreviousState);

                await LogAsync(new LogHistoryRequest
                {
                    EntityName = log.EntityName,
                    EntityId = log.EntityId,
                    Title = $"Reverted: restored {log.EntityName} '{log.EntityId}' to previous state (undid UPDATE)",
                    ActionType = CRMActionType.Update,
                    PreviousState = log.UpdatedState,
                    UpdatedState = log.PreviousState
                });
            }

            private async Task DeleteEntityByNameAsync(string entityName, string entityId)
            {
                switch (entityName.ToUpper())
                {
                    case "DEAL":
                        var deal = await _db.Deals.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Deal '{entityId}' not found.");
                        _db.Deals.Remove(deal);
                        break;

                    case "LEAD":
                        var lead = await _db.Leads.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Lead '{entityId}' not found.");
                        _db.Leads.Remove(lead);
                        break;

                    case "TICKET":
                        var ticket = await _db.Tickets.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Ticket '{entityId}' not found.");
                        _db.Tickets.Remove(ticket);
                        break;

                    case "CLIENT":
                        var client = await _db.Contacts.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Client '{entityId}' not found.");
                        _db.Contacts.Remove(client);
                        break;

                    default:
                        throw new NotSupportedException($"Entity type '{entityName}' is not supported for revert.");
                }

                await _db.SaveChangesAsync();
            }

            private async Task RestoreEntityByNameAsync(string entityName, string snapshot)
            {
                switch (entityName.ToUpper())
                {
                    case "DEAL":
                        var deal = JsonSerializer.Deserialize<Deal>(snapshot, _jsonOpts)!;
                        await _db.Deals.AddAsync(deal);
                        break;

                    case "LEAD":
                        var lead = JsonSerializer.Deserialize<Lead>(snapshot, _jsonOpts)!;
                        await _db.Leads.AddAsync(lead);
                        break;

                    case "TICKET":
                        var ticket = JsonSerializer.Deserialize<Ticket>(snapshot, _jsonOpts)!;
                        await _db.Tickets.AddAsync(ticket);
                        break;

                    case "CLIENT":
                        var client = JsonSerializer.Deserialize<Contact>(snapshot, _jsonOpts)!;
                        await _db.Contacts.AddAsync(client);
                        break;

                    default:
                        throw new NotSupportedException($"Entity type '{entityName}' is not supported for revert.");
                }

                await _db.SaveChangesAsync();
            }

            private async Task PatchEntityByNameAsync(string entityName, string entityId, string snapshot)
            {
                switch (entityName.ToUpper())
                {
                    case "DEAL":
                        var deal = await _db.Deals.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Deal '{entityId}' not found.");
                        var prevDeal = JsonSerializer.Deserialize<Deal>(snapshot, _jsonOpts)!;
                        _db.Entry(deal).CurrentValues.SetValues(prevDeal);
                        break;

                    case "LEAD":
                        var lead = await _db.Leads.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Lead '{entityId}' not found.");
                        var prevLead = JsonSerializer.Deserialize<Lead>(snapshot, _jsonOpts)!;
                        _db.Entry(lead).CurrentValues.SetValues(prevLead);
                        break;

                    case "TICKET":
                        var ticket = await _db.Tickets.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Ticket '{entityId}' not found.");
                        var prevTicket = JsonSerializer.Deserialize<Ticket>(snapshot, _jsonOpts)!;
                        _db.Entry(ticket).CurrentValues.SetValues(prevTicket);
                        break;

                    case "CLIENT":
                        var client = await _db.Contacts.FindAsync(entityId)
                            ?? throw new KeyNotFoundException($"Client '{entityId}' not found.");
                        var prevClient = JsonSerializer.Deserialize<Contact>(snapshot, _jsonOpts)!;
                        _db.Entry(client).CurrentValues.SetValues(prevClient);
                        break;

                    default:
                        throw new NotSupportedException($"Entity type '{entityName}' is not supported for revert.");
                }

                await _db.SaveChangesAsync();
            }


            private static HistoryResponseDto Map(CRMHistory h) => new()
            {
                Id = h.Id,
                EntityName = h.EntityName,
                EntityId = h.EntityId,
                Title = h.Title,
                ActionType = h.ActionTypeRaw,
                RevertType = h.RevertTypeRaw,
                ModifiedData = h.ModifiedData,
                PreviousState = h.PreviousState,
                UpdatedState = h.UpdatedState,
                InitiatedAt = h.InitiatedAt,
                InitiatedById = h.InitiatedById,
                InitiatedByName = h.InitiatedBy?.Name
            };
        }
}
