export interface Contact {
    id: string;
    name: string;
    company: string;
    designation: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    createdAt: string; 
    deals?: any[];     // Replace 'any' with your Deal interface if available
    tickets?: any[];    // Replace 'any' with your Ticket interface if available
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