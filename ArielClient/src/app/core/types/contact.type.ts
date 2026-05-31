export interface Contact {
    id: string;
    name: string;
    company: string;
    designation: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    createdAt: string;
    deals?: any[];
    tickets?: any[];
}

export interface CreateContactPayload {
    name: string;
    company: string;
    designation?: string;
    email: string;
    phone?: string | null;
    address?: string | null;
}

export interface UpdateContactPayload {
    name: string;
    company: string;
    designation: string;
    email: string;
    phone?: string | null;
    address?: string | null;
}