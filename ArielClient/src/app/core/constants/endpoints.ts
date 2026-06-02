export const BASE_URL = 'https://localhost:7111';
export const SignalRUrl = `${BASE_URL}/notificationHub`;



export const endpoints = {

    login: `${BASE_URL}/api/auth/login`,
    logout: `${BASE_URL}/api/auth/logout`,
    register: `${BASE_URL}/api/auth/register`,
    authenticate: `${BASE_URL}/api/auth/me`,
    teamMembers: `${BASE_URL}/api/admin/team-members`,


    // leads 
    getLeads: `${BASE_URL}/api/leads`,
    searchLeads: `${BASE_URL}/api/leads/search?q=`,
    createLead: `${BASE_URL}/api/leads`,
    updateLead: (id: string) => `${BASE_URL}/api/leads/${id}`,
    deleteLead: (id: string) => `${BASE_URL}/api/leads/${id}`,


    // contacts
    getContacts: `${BASE_URL}/api/contacts`,
    getContactById: (id: string) => `${BASE_URL}/api/contacts/${id}`,
    createContact: `${BASE_URL}/api/contacts`,
    updateContact: (id: string) => `${BASE_URL}/api/contacts/${id}`,
    deleteContact: (id: string) => `${BASE_URL}/api/contacts/${id}`,


    // deals
    getDeals: `${BASE_URL}/api/deals`,
    createDeal: `${BASE_URL}/api/deals`,
    updateDeal: (id: string) => `${BASE_URL}/api/deals/${id}`,
    updateDealStage: (id: string) => `${BASE_URL}/api/deals/${id}/stage`,


    // notes
    notes: `${BASE_URL}/api/notes`,


    // tasks
    tasks: `${BASE_URL}/api/crmTasks`,


    // tickets 
    ticket: `${BASE_URL}/api/tickets`,


    // meetings
    meetings: `${BASE_URL}/api/meetings`

}

export enum Routes {
    signIn = "/sign-in",
    dashboard = "/dashboard"

}
