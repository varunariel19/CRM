export interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string | null;
    source: LeadSource;
    status: LeadStatus;
    assignedToId: string;
    assignedToName: string;
    createdAt: string;
}


export interface CreateLeadDto {
    name: string;
    company: string;
    email: string;
    phone?: string;
    source: LeadSource;
    assignedToId: string;
}

export interface UpdateLeadDto {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    source?: LeadSource;
    status?: LeadStatus;
    assignedToId?: string;
}

export type LeadSource =
    | 'Website'
    | 'Referral'
    | 'Instagram'
    | 'ColdCall'
    | 'LinkedIn';


export type LeadStatus = 'New' | 'Contracted' | 'Qualified' | 'Converted' | 'Lost';





