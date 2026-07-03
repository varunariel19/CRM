
export interface LoginPayload {
    email: string;
    password: string;
}


export interface PermissionPayload {
    id: string;
    code: string;
    description?: string;
}

export interface AccessLevelPayload {
    id: string;
    name: string;
    access: number;
    permissions: PermissionPayload[];
}

export interface UserSummary  {
     id : string;
     name : string;
     profileImage : string;
}

export interface UserPayload {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    departmentId: string;
    designationId: string;
    accessLevel: AccessLevelPayload;
}

