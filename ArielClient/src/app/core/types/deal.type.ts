import { Contact } from "./contact.type";

export const DEAL_STAGE = {
    PROPOSAL: 'Proposal',
    NEGOTIATION: 'Negotiation',
    WON: 'Won',
    LOST: 'Lost',
} as const;

export type DealStage =
    typeof DEAL_STAGE[keyof typeof DEAL_STAGE];


export interface Deal {
    id: string;
    title: string;
    value: number;
    stage: DealStage;
    closeDate: string;
    assignedToId: string;
    contactId: string;
    createdAt: string;
    assignedTo?: User | null;
    contact?: Contact | null;
    tasks?: CrmTask[];
}

export interface CreateDealPayload {
    title: string;
    value: number;
    stage: DealStage;
    closeDate: string;
    assignedToId: string;
    contactId?: string | null;
}

export interface UpdateDealPayload {
    title: string;
    value: number;
    stage: DealStage;
    closeDate: string;
    assignedToId: string;
    contactId?: string | null;
}

export interface UpdateDealStagePayload {
    stage: DealStage;
}


export interface PipelineColumn {
    key: string;       // matches lowercase equivalent representation e.g. 'proposal'
    title: string;     // Column display label e.g. 'PROPOSAL'
    color: string;     // Color badge tracking hexadecimal configuration
    stage: DealStage;  // Enum fallback binding
    deals: Deal[];     // Active deal cards inside this tracking lane
}

// Basic relational entity mocks for compile-safety
export interface User {
    id: string;
    name: string;
    email: string;
}



export interface CrmTask {
    id: string;
    title: string;
    status: number;
}