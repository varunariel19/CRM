import { UserRole } from "../types/global.type";

export const ROLE_LABELS: Record<UserRole, string> = {
    Admin: 'Admin',
    Manager: 'Manager',
    SalesExecutive: 'Sales Executive',
    BDE: 'BDE',
    SupportAgent: 'Support Agent',
};

export const ROLE_COLORS: Record<UserRole, string> = {
    Admin: 'badge-admin',
    Manager: 'badge-manager',
    SalesExecutive: 'badge-sales',
    BDE: 'badge-bde',
    SupportAgent: 'badge-support',
};

export const ROLES: UserRole[] = [
    'Admin',
    'Manager',
    'SalesExecutive',
    'BDE',
    'SupportAgent',
];

export const FILTER_TABS: ('All' | UserRole)[] = [
    'All',
    'Admin',
    'Manager',
    'SalesExecutive',
    'BDE',
    'SupportAgent',
];