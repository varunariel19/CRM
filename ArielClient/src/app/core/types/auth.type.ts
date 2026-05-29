import { UserRole } from "./global.type";

export interface LoginPayload {
    email: string;
    password: string;
}


export interface UserRes {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}
