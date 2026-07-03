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
    public class HistoryService(
        IHistoryRepository repo,
        AppDbContext db,
        IHttpContextAccessor httpContext) : IHistoryService
    {
        private readonly IHistoryRepository _repo = repo;
        private readonly AppDbContext _db = db;
        private readonly IHttpContextAccessor _httpContext = httpContext;

        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        private string GetRequiredUserId()
        {
            var userId = _httpContext.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
                throw new UnauthorizedAccessException("User ID not found in token.");

            return userId;
        }

        private string? GetIpAddress() =>
            _httpContext.HttpContext?.Connection.RemoteIpAddress?.ToString();

        private string? GetUserAgent() =>
            _httpContext.HttpContext?.Request.Headers["User-Agent"].ToString();

        private string? GetCorrelationId() =>
            _httpContext.HttpContext?.Request.Headers["X-Correlation-ID"].ToString();

        private string? GetSessionId() =>
            _httpContext.HttpContext?.Request.Headers["X-Session-ID"].ToString();

        private static AuditRevertType MapRevertType(AuditActionType action) => action switch
        {
            AuditActionType.Create => AuditRevertType.Delete,
            AuditActionType.Delete => AuditRevertType.Create,
            AuditActionType.Update => AuditRevertType.Update,
            AuditActionType.BulkCreate => AuditRevertType.Delete,
            AuditActionType.BulkUpdate => AuditRevertType.Update,
            AuditActionType.BulkDelete => AuditRevertType.Create,
            _ => AuditRevertType.None
        };


        private AuditLog BuildAuditLog(
            string entityName,
            string entityId,
            string title,
            AuditActionType actionType,
            string initiatedById,
            string? previousState = null,
            string? updatedState = null,
            string? diffData = null,
            string? batchId = null,
            string? parentAuditId = null,
            AuditSourceType source = AuditSourceType.User,
            AuditStatus status = AuditStatus.Success,
            string? failureReason = null,
            string? entityDisplayName = null,
            string? entityUrl = null,
            string? actionDescription = null,
            string? extraMetadata = null)
        {
            string? affectedFields = null;
            if (!string.IsNullOrWhiteSpace(diffData))
            {
                try
                {
                    var diffDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(diffData);
                    if (diffDict?.Keys.Any() == true)
                        affectedFields = JsonSerializer.Serialize(diffDict.Keys.ToList());
                }
                catch { }
            }

            return new AuditLog
            {
                EntityName = entityName,
                EntityId = entityId,
                EntityDisplayName = entityDisplayName,
                EntityUrl = entityUrl,
                Title = title,
                ActionType = actionType,
                ActionDescription = actionDescription,
                RevertType = MapRevertType(actionType),
                DiffData = diffData,
                AffectedFields = affectedFields,
                PreviousState = previousState,
                UpdatedState = updatedState,
                BatchId = batchId,
                ParentAuditId = parentAuditId,
                Status = status,
                FailureReason = failureReason,
                Source = source,
                IpAddress = GetIpAddress(),
                UserAgent = GetUserAgent(),
                CorrelationId = GetCorrelationId(),
                SessionId = GetSessionId(),
                ExtraMetadata = extraMetadata,
                InitiatedById = initiatedById,
                InitiatedAt = DateTime.UtcNow
            };
        }

        public async Task LogAsync(LogHistoryRequest request)
        {
            var userId = GetRequiredUserId();
            var actionType = Enum.Parse<AuditActionType>(request.ActionType, true);

            string? diffData = null;
            if (actionType is AuditActionType.Update or AuditActionType.BulkUpdate)
                diffData = HtmlDiffHelper.GenerateDiff(request.PreviousState, request.UpdatedState);

            var log = BuildAuditLog(
                entityName: request.EntityName,
                entityId: request.EntityId,
                title: request.Title,
                actionType: actionType,
                initiatedById: userId,
                previousState: request.PreviousState,
                updatedState: request.UpdatedState,
                diffData: diffData,
                source: AuditSourceType.User);

            await _repo.AddAsync(log);
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
            string? diffData = null;
            if (dto.ActionType is AuditActionType.Update or AuditActionType.BulkUpdate)
                diffData = HtmlDiffHelper.GenerateDiff(dto.PreviousState, dto.UpdatedState);

            var log = BuildAuditLog(
                entityName: dto.EntityName,
                entityId: dto.EntityId,
                title: dto.Title,
                actionType: dto.ActionType,
                initiatedById: initiatedById,
                previousState: dto.PreviousState,
                updatedState: dto.UpdatedState,
                diffData: diffData ?? dto.DiffData,
                source: AuditSourceType.User);

            await _repo.AddAsync(log);
            await _repo.SaveChangesAsync();
            return Map(log);
        }

        public async Task DeleteAsync(string id)
        {
            var log = await _repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Audit log '{id}' not found.");
            await _repo.DeleteAsync(log);
            await _repo.SaveChangesAsync();
        }

        public async Task DeleteAllAsync() =>
            await _repo.DeleteAllAsync();

        public async Task RevertAsync(string auditLogId)
        {
            var initiatedById = GetRequiredUserId();

            var log = await _repo.GetByIdAsync(auditLogId)
                ?? throw new KeyNotFoundException($"Audit log '{auditLogId}' not found.");

            if (log.IsReverted)
                throw new InvalidOperationException($"Audit log '{auditLogId}' has already been reverted.");

            // Snapshot state before revert for the revert history record
            var snapshotBefore = await TakeCurrentSnapshotAsync(log.EntityName, log.EntityId);

            switch (log.ActionType)
            {
                case AuditActionType.Create:
                    await RevertCreate(log, initiatedById);
                    break;
                case AuditActionType.Delete:
                    await RevertDelete(log, initiatedById);
                    break;
                case AuditActionType.Update:
                    await RevertUpdate(log, initiatedById);
                    break;
                default:
                    throw new NotSupportedException($"Revert not supported for action '{log.ActionTypeRaw}'.");
            }

            // Mark original log as reverted
            log.IsReverted = true;
            log.RevertedAt = DateTime.UtcNow;
            log.RevertedById = initiatedById;

            // Write full revert chain record
            var revertHistory = new AuditRevertHistory
            {
                AuditLogId = log.Id,
                SnapshotBeforeRevert = snapshotBefore,
                SnapshotAfterRevert = await TakeCurrentSnapshotAsync(log.EntityName, log.EntityId),
                RevertedById = initiatedById,
                RevertedAt = DateTime.UtcNow
            };

            await _db.AuditRevertHistories.AddAsync(revertHistory);
            await _db.SaveChangesAsync();
        }

        private async Task RevertCreate(AuditLog log, string initiatedById)
        {
            await DeleteEntityByNameAsync(log.EntityName, log.EntityId);

            var revertLog = BuildAuditLog(
                entityName: log.EntityName,
                entityId: log.EntityId,
                title: $"Revert: deleted {log.EntityName} '{log.EntityId}' (undid CREATE)",
                actionType: AuditActionType.Delete,
                initiatedById: initiatedById,
                previousState: log.UpdatedState,
                parentAuditId: log.Id,
                source: AuditSourceType.User,
                actionDescription: $"Revert of audit log {log.Id}");

            await _repo.AddAsync(revertLog);
            await _repo.SaveChangesAsync();
        }

        private async Task RevertDelete(AuditLog log, string initiatedById)
        {
            if (string.IsNullOrWhiteSpace(log.PreviousState))
                throw new InvalidOperationException("Cannot revert DELETE: PreviousState snapshot is missing.");

            await RestoreEntityByNameAsync(log.EntityName, log.PreviousState);

            var revertLog = BuildAuditLog(
                entityName: log.EntityName,
                entityId: log.EntityId,
                title: $"Revert: restored {log.EntityName} '{log.EntityId}' (undid DELETE)",
                actionType: AuditActionType.Create,
                initiatedById: initiatedById,
                updatedState: log.PreviousState,
                parentAuditId: log.Id,
                source: AuditSourceType.User,
                actionDescription: $"Revert of audit log {log.Id}");

            await _repo.AddAsync(revertLog);
            await _repo.SaveChangesAsync();
        }

        private async Task RevertUpdate(AuditLog log, string initiatedById)
        {
            if (string.IsNullOrWhiteSpace(log.PreviousState))
                throw new InvalidOperationException("Cannot revert UPDATE: PreviousState snapshot is missing.");

            await PatchEntityByNameAsync(log.EntityName, log.EntityId, log.PreviousState);

            var diffData = HtmlDiffHelper.GenerateDiff(log.UpdatedState, log.PreviousState);

            var revertLog = BuildAuditLog(
                entityName: log.EntityName,
                entityId: log.EntityId,
                title: $"Revert: restored {log.EntityName} '{log.EntityId}' to previous state (undid UPDATE)",
                actionType: AuditActionType.Update,
                initiatedById: initiatedById,
                previousState: log.UpdatedState,
                updatedState: log.PreviousState,
                diffData: diffData,
                parentAuditId: log.Id,
                source: AuditSourceType.User,
                actionDescription: $"Revert of audit log {log.Id}");

            await _repo.AddAsync(revertLog);
            await _repo.SaveChangesAsync();
        }

        private async Task<string?> TakeCurrentSnapshotAsync(string entityName, string entityId)
        {
            object? entity = entityName.ToUpper() switch
            {
                "DEAL" => await _db.Deals.FindAsync(entityId),
                "LEAD" => await _db.Leads.FindAsync(entityId),
                "TICKET" => await _db.Tickets.FindAsync(entityId),
                "CLIENT" => await _db.Contacts.FindAsync(entityId),
                _ => null
            };

            return entity is null ? null : JsonSerializer.Serialize(entity, _jsonOpts);
        }

        private async Task DeleteEntityByNameAsync(string entityName, string entityId)
        {
            switch (entityName.ToUpper())
            {
                case "DEAL":
                    _db.Deals.Remove(await _db.Deals.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Deal '{entityId}' not found."));
                    break;
                case "LEAD":
                    _db.Leads.Remove(await _db.Leads.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Lead '{entityId}' not found."));
                    break;
                case "TICKET":
                    _db.Tickets.Remove(await _db.Tickets.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Ticket '{entityId}' not found."));
                    break;
                case "CLIENT":
                    _db.Contacts.Remove(await _db.Contacts.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Client '{entityId}' not found."));
                    break;
                default:
                    throw new NotSupportedException($"Entity '{entityName}' not supported for revert.");
            }
            await _db.SaveChangesAsync();
        }

        private async Task RestoreEntityByNameAsync(string entityName, string snapshot)
        {
            switch (entityName.ToUpper())
            {
                case "DEAL":
                    await _db.Deals.AddAsync(JsonSerializer.Deserialize<Deal>(snapshot, _jsonOpts)!);
                    break;
                case "LEAD":
                    await _db.Leads.AddAsync(JsonSerializer.Deserialize<Lead>(snapshot, _jsonOpts)!);
                    break;
                case "TICKET":
                    await _db.Tickets.AddAsync(JsonSerializer.Deserialize<Ticket>(snapshot, _jsonOpts)!);
                    break;
                case "CLIENT":
                    await _db.Contacts.AddAsync(JsonSerializer.Deserialize<Contact>(snapshot, _jsonOpts)!);
                    break;
                default:
                    throw new NotSupportedException($"Entity '{entityName}' not supported for restore.");
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
                    _db.Entry(deal).CurrentValues.SetValues(JsonSerializer.Deserialize<Deal>(snapshot, _jsonOpts)!);
                    break;
                case "LEAD":
                    var lead = await _db.Leads.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Lead '{entityId}' not found.");
                    _db.Entry(lead).CurrentValues.SetValues(JsonSerializer.Deserialize<Lead>(snapshot, _jsonOpts)!);
                    break;
                case "TICKET":
                    var ticket = await _db.Tickets.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Ticket '{entityId}' not found.");
                    _db.Entry(ticket).CurrentValues.SetValues(JsonSerializer.Deserialize<Ticket>(snapshot, _jsonOpts)!);
                    break;
                case "CLIENT":
                    var client = await _db.Contacts.FindAsync(entityId)
                        ?? throw new KeyNotFoundException($"Client '{entityId}' not found.");
                    _db.Entry(client).CurrentValues.SetValues(JsonSerializer.Deserialize<Contact>(snapshot, _jsonOpts)!);
                    break;
                default:
                    throw new NotSupportedException($"Entity '{entityName}' not supported for patch.");
            }
            await _db.SaveChangesAsync();
        }


        public async Task<IEnumerable<HistoryResponseDto>> GetByBatchAsync(string batchId)
        {
            var items = await _repo.GetByBatchAsync(batchId);
            return items.Select(Map);
        }

        public async Task<IEnumerable<HistoryResponseDto>> GetChildLogsAsync(string parentAuditId)
        {
            var items = await _repo.GetChildLogsAsync(parentAuditId);
            return items.Select(Map);
        }

        public async Task<IEnumerable<RevertHistoryResponseDto>> GetRevertHistoryAsync(string auditLogId)
        {
            var items = await _repo.GetRevertHistoryAsync(auditLogId);
            return items.Select(r => new RevertHistoryResponseDto
            {
                Id = r.Id,
                AuditLogId = r.AuditLogId,
                SnapshotBeforeRevert = r.SnapshotBeforeRevert,
                SnapshotAfterRevert = r.SnapshotAfterRevert,
                RevertNote = r.RevertNote,
                RevertedAt = r.RevertedAt,
                RevertedById = r.RevertedById,
                RevertedByName = r.RevertedBy?.Name
            });
        }


        private static HistoryResponseDto Map(AuditLog h) => new()
        {
            Id = h.Id,
            EntityName = h.EntityName,
            EntityId = h.EntityId,
            EntityDisplayName = h.EntityDisplayName,
            Title = h.Title ?? "",
            ActionType = h.ActionTypeRaw,
            RevertType = h.RevertTypeRaw,
            DiffData = h.DiffData,
            AffectedFields = h.AffectedFields,
            PreviousState = h.PreviousState,
            UpdatedState = h.UpdatedState,
            IsReverted = h.IsReverted,
            RevertedAt = h.RevertedAt,
            Status = h.StatusRaw,
            Source = h.SourceRaw,
            IpAddress = h.IpAddress,
            CorrelationId = h.CorrelationId,
            InitiatedAt = h.InitiatedAt,
            CommitedBy = new UserSummaryDto
            {
                Id = h.InitiatedBy.Id,
                Name = h.InitiatedBy.Name,
                ProfileImage = h.InitiatedBy.ProfileImage ?? ""
            }
        };




    }
}