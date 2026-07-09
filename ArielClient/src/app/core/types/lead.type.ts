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

export interface LeadProjectDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadId: string;
  uploadedAt?: string;
}

export interface LeadProject {
  id: string;
  name: string;
  projectType: ProjectType | '';
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  isListed: boolean;
  isActive: boolean;
  projectLeadId: string | null;
  projectLeadName: string | null;
  description: string | null;
  documents: LeadProjectDocument[];
}



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
  updatedAt: string;
  projects: LeadProject[];
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
    dealCloseDate?: string | null;
}
