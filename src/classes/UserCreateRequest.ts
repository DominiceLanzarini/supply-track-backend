import { UserProfile } from "../entities/User";

export class UserCreateRequest {
    name: string;
    profile: UserProfile;
    email: string;
    password: string;
    document: string;
    full_address?: string;
}