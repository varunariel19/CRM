namespace ArielCRM.DataLayer.Enums
{
    public enum LeadSource
    {
        Website,
        Referral,
        LinkedIn,
        Instagram,
        ColdCall
    }

    public enum LeadStatus
    {
        New,
        Contracted,
        Qualified,
        Converted,
        Lost,

    }

    public enum DealStage
    {
        Proposal,
        Negotiation,
        Won,
        Lost
    }

    public enum TaskType
    {
        Call,
        Email,
        Meeting,
        Demo
    }

    public enum CrmTaskStatus
    {
        Pending,
        Completed
    }

    public enum TicketStatus
    {
        Todo,
        InProgress,
        Review,
        Done
    }

    public enum TicketPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum RelatedEntityType
    {
        Lead,
        Contact,
        Deal,
        Ticket
    }


    public enum TicketType
    {
        Bug,
        Feature,
        Task,
        Improvement,
        Documentation
    }





}
