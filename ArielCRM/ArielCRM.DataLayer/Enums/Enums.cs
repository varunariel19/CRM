namespace ArielCRM.DataLayer.Enums
{
    public enum LeadSource
    {
        MarketingPlatform,
        Website,
        Referrals,
        LinkedIn,
        Events,
        Partners,
        ColdOutreach
    }

    public enum LeadStatus
    {
        Contracted,
        Qualified,
        Converted,
        Lost,

    }

    namespace ArielCRM.DataLayer.Enums
    {
        public enum  ProjectType
        {
            Hourly,
            FixedPrice,
            ManMonth
        }
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
