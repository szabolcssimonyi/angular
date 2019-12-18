import { Job } from './Job';
import { Group } from './group';

export interface User {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    tel: string;
    active: number;
    avatar: string;
    avatar_img: File;
    gender_id: number;
    work_started_date: string;
    is_hidden: number;
    is_deleted: number;
    last_logged_at: number;
    created_at: string;
    updated_at: string;
    lang_id: number | undefined;
    lang: { id: number, code: string, name: string };
    role: string;
    permissions: string[];
    job: Job | number;
    group: Group | number;
    external_id: number;
}
