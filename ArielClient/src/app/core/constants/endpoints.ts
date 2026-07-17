import { environment } from "../../../environments/environment";

export const BASE_URL = environment.baseUrl;
export const SignalRUrl = `${BASE_URL}/notificationHub`;
export const TeamsHubUrl = `${BASE_URL}/teamsHub`;



export const endpoints = {

    login: `${BASE_URL}/api/auth/login`,
    logout: `${BASE_URL}/api/auth/logout`,
    authenticate: `${BASE_URL}/api/auth/me`,
    saveEncryptionKey: `${BASE_URL}/api/auth/encryption-key`,

    // user
    user: `${BASE_URL}/api/user`,


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
    meetings: `${BASE_URL}/api/meetings`,

    // history

    history: `${BASE_URL}/api/history`,


    // team members
    teamMembers: `${BASE_URL}/api/team`,


    // project 
    projects: `${BASE_URL}/api/projects`,


    // task management ! 
    taskM: `${BASE_URL}/api/tasks`,


    // commments : 
    comments: `${BASE_URL}/api/comments`,


    ticketHistory: `${BASE_URL}/api/ticket-history`,

    // teams messaging
    teams: {
        users: `${BASE_URL}/api/teams/users`,
        conversations: `${BASE_URL}/api/teams/conversations`,
        direct: `${BASE_URL}/api/teams/conversations/direct`,
        groups: `${BASE_URL}/api/teams/conversations/groups`,
        addMembers: (conversationId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/members`,
        messages: (conversationId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/messages`,
        sendMessage: (conversationId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/messages`,
        markRead: (conversationId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/read`,
        editMessage: (conversationId: string, messageId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/messages/${messageId}`,
        deleteMessage: (conversationId: string, messageId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/messages/${messageId}`,
        restoreMessage: (conversationId: string, messageId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/messages/${messageId}/restore`,
        scheduledMessages: (conversationId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/scheduled-messages`,
        cancelScheduledMessage: (conversationId: string, messageId: string) => `${BASE_URL}/api/teams/conversations/${conversationId}/scheduled-messages/${messageId}`,
    },


    notification: {
        createNotification: `${BASE_URL}/api/notifications/create-notification`,
        allNotification: `${BASE_URL}/api/notifications`, // ?take=30
        unreadCount: `${BASE_URL}/api/notifications/unread-count`,
        singleRead: (notificationId: string) => `${BASE_URL}/api/notifications/${notificationId}/read`,
        allRead: `${BASE_URL}/api/notifications/read-all`,
        remove: (notificationId: string) => `${BASE_URL}/api/notifications/${notificationId}`,
        clearRead: `${BASE_URL}/api/notifications/clear-all`,
    },


    folders: {
        root: `${BASE_URL}/api/folders/root-folders`,
        children: (parentFolderId: string) => `${BASE_URL}/api/folders/${parentFolderId}/children`,
        uploadFile: `${BASE_URL}/api/folders/upload-file`,
        createFolder : `${BASE_URL}/api/folders/create-folder`
    },


    AIUrl: environment.ai.url,
    groqApiKey: environment.ai.apiKey,

    PERMISSIONS: `${BASE_URL}/api/admin/permissions`,
    DEPARTMENTS: `${BASE_URL}/api/admin/departments`,
    ACCESS_LEVELS: `${BASE_URL}/api/admin/access-levels`,
    DESIGNATIONS: `${BASE_URL}/api/admin/designations`,

}

export const appwrite = {
    production: environment.production,
    appwriteEndpoint: environment.appwrite.endpoint,
    appwriteProjectId: environment.appwrite.projectId,
    appwriteBucketId: environment.appwrite.bucketId,
};

export enum Routes {
    signIn = "/sign-in",
    dashboard = "/dashboard",
}
