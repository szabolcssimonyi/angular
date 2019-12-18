import { Permission } from './permission';

export interface Role {
    name: string;
    value: string;
    permissions: Permission[];
}
