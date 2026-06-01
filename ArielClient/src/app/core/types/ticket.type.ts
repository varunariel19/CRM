export const TICKET_STATUS = {
    OPEN: 'Open',
    IN_PROGRESS: 'InProgress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical'
} as const;

export type TicketPriority = typeof TICKET_PRIORITY[keyof typeof TICKET_PRIORITY];

export interface TicketPayload {
    title: string;
    description: string;
    priority: TicketPriority | string;
    assignedToId: string;
    clientId?: string;
}

export interface Ticket extends TicketPayload {
    id: string;
    ticketCode: string;
    status: TicketStatus;
    createdAt: string;
    assignedMemberName: string;
    clientInfo: {
        name: string;
        company: string;
        email: string;
    }
}



export interface TicketPipelineColumn {
    key: string;
    title: string;
    color: string;
    status: TicketStatus;
    tickets: Ticket[];
}