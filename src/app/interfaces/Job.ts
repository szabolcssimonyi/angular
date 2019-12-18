export interface Job {
    id: number;
    name: string;
    short_name: string;
    external_id: number;
    assigned_role: string;
    min_user_assign_role: number;
    created_at: Date;
    updated_at: Date;
}
