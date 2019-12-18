import { Job } from './Job';
import { GroupJobAssignment } from './group-job-assignment';

export interface Group {
    id: number;
    parent_id: number;
    type: number;
    name: string;
    short_name: string;
    external_id: string;
    level: number;
    created_at: Date;
    updated_at: Date;
    jobs: Job[] | GroupJobAssignment[] | number[];
    groupJobs: GroupJobAssignment[];
    user_count: number;
}
