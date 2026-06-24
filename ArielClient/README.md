## Feature: Universal History/Audit Log System

### Overview
Build a complete **History/Audit Log** module (`controller`, `service`, `repository`) that tracks every meaningful action performed on core entities across the application.

---

### Entities to Track
`DEAL` | `LEAD` | `TICKET` | `CLIENT`

### Action Types
`CREATE` | `UPDATE` | `DELETE`

---

### Requirements

**1. History Schema**
```cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    public enum CRMActionType
    {
        Create,
        Update,
        Delete
    }

    public enum CRMRevertType
    {
        None,
        Delete,      
        Update,  
        Create      
    }

    [Table("crm_history")]
    public class CRMHistory
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("entity_name")]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        [Required]
        [Column("entity_id")]
        [MaxLength(50)]
        public string EntityId { get; set; } = string.Empty;

        [Required]
        [Column("title", TypeName = "text")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("action_type")]
        [MaxLength(20)]
        public string ActionTypeRaw { get; set; } = CRMActionType.Create.ToString();

        [NotMapped]
        public CRMActionType ActionType
        {
            get => Enum.Parse<CRMActionType>(ActionTypeRaw, ignoreCase: true);
            set => ActionTypeRaw = value.ToString();
        }

        [Required]
        [Column("revert_type")]
        [MaxLength(20)]
        public string RevertTypeRaw { get; set; } = CRMRevertType.None.ToString();

        [NotMapped]
        public CRMRevertType RevertType
        {
            get => Enum.Parse<CRMRevertType>(RevertTypeRaw, ignoreCase: true);
            set => RevertTypeRaw = value.ToString();
        }

        [Column("modified_data", TypeName = "text")]
        public string? ModifiedData { get; set; }

        [Required]
        [Column("initiated_at")]
        public DateTime InitiatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("initiated_by_id")]
        [MaxLength(50)]
        public string InitiatedById { get; set; } = string.Empty;

        [ForeignKey("InitiatedById")]
        public User InitiatedBy { get; set; } = null!;

        [Column("previous_state", TypeName = "text")]
        public string? PreviousState { get; set; }

        [Column("updated_state", TypeName = "text")]
        public string? UpdatedState { get; set; }
    }
}
```
---

**2. Title — Human-Readable Summary**
Every log entry must have a concise, descriptive `title` that lets an admin instantly understand what happened. Examples:

| Action | Title |
|---|---|
| Status change | `Moved Deal from 'Proposal' → 'Won'` |
| Field update | `Deal 'Apollo Project' has been updated` |
| New record | `New Lead 'John Doe' was created` |
| Deletion | `Ticket #482 has been deleted` |

---

**3. `modifiedFields` — HTML Diff (UPDATE only)**
When `actionType = UPDATE`, compute a field-level diff between `previousState` and `newState`. Store it as a **styled HTML string** that renders cleanly in an admin UI:
- Struck-through red for old value
- Green for new value
- One row per changed field
- Skip unchanged fields

---

**4. Revert Method**
Expose a `revert(historyId)` method that restores an entity to its state before the logged action:
- `CREATE` log → **delete** the entity
- `DELETE` log → **re-create** the entity from `previousState`
- `UPDATE` log → **patch** the entity back to `previousState`

---

**5. API Endpoints**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/history` | Get all history (paginated, filterable) |
| `GET` | `/history/:entityType/:entityId` | Get history for a specific entity |
| `POST` | `/history` | Manually add a log entry |
| `DELETE` | `/history` | Delete all history |
| `DELETE` | `/history/:id` | Delete single log entry |
| `POST` | `/history/:id/revert` | Revert entity to pre-action state |

---

**6. Integration Guide**
Show exactly how to inject and call `HistoryService` inside `DealService`, `LeadService`, `TicketService`, and `ClientService` — with real code examples for each action type.

---

Now go ahead and implement this fully.


Updated deal 'Data Warehouse Modernization Project'



{"Id":"76f03544-6060-44e7-920b-147652692e3c",
"Title":"Data Warehouse Modernization Project",
"Value":14000,
"Stage":0,
"CloseDate":"2026-07-30",
"AssignedToId":"37340583-80f0-436f-9659-3a057636fbac",
"ContactId":"a171110d-043b-4a36-8322-f3ad885d1c28",
"CreatedAt":"2026-06-02T09:52:08.8230779",
"AssignedTo":null,
"Contact":null,
"Tasks":[]
}

## Ticket History : 
1. ticket creation initally created.
2. if updated like status 
    TODO -> INPROGRESS  then it should changed 
3. if any other thing like title and descritpion , 
   summary 


4. commitedBy : {
     id : string;
     name : string;
     profileImage : string;
}

creation
Fields  : 
1. Status, Priority , Type , Description, Title, Summary.

TITLE : Html text 
content : html text 

for 


# Added Ai automatic geneation of content for message suggestion based 
  on ticket review.
# User can auto generate the little desc into explained on and also 
  generate the whole summary of ticket 

# Created Ticket History section which keep the track of each ticket through it's completion.
