export type LeadSource =
  | 'MarketingPlatform'
  | 'Website'
  | 'Referrals'
  | 'LinkedIn'
  | 'Events'
  | 'Partners'
  | 'ColdOutreach';

export enum LeadStatusType {
    Contracted = 'Contracted',
    Qualified = 'Qualified',
    Converted = 'Converted',
    Lost = 'Lost'
}
export type LeadStatus = keyof typeof LeadStatusType;

export type ProjectType = 'Hourly' | 'FixedPrice' | 'ManMonth';

export interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string | null;
    source: LeadSource;
    status: LeadStatus;
    contactId: string;
    assignedToId: string;
    assignedToName: string;
    createdAt: string;
    projectTitle: string;
    budget: number | null;
    projectType: ProjectType | '';
    dealStartDate: string;
    dealCloseDate?: string | null;
}

export interface CreateLeadDto {
    name: string;
    company: string;
    email: string;
    phone?: string;
    source: LeadSource;
    assignedToId: string;
    projectTitle?: string;
    budget?: number | null;
    projectType?: ProjectType | '';
    dealStartDate?: string;
    dealCloseDate?: string | null;
}

export interface UpdateLeadDto {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    source?: LeadSource;
    contactId?: string;
    status?: LeadStatus;
    assignedToId?: string;
    projectTitle?: string;
    budget?: number | null;
    projectType?: ProjectType | '';
    dealStartDate?: string;
    dealCloseDate?: string;
}