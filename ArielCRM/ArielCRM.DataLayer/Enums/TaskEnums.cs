namespace ArielCRM.DataLayer.Enums
{
    public enum TaskPriority
    {
        LOW = 1,
        MEDIUM = 2,
        HIGH = 3,
        CRITICAL = 4
    }

    public enum TicketTaskType
    {
        FEATURE = 1,
        BUG = 2,
        TASK = 3,
        CHORE = 4
    }

    public enum TasksStatus
    {
        TODO = 1,
        IN_PROGRESS = 2,
        REVIEW = 3,
        DONE = 4
    }
}