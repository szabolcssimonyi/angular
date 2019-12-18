import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { PageList, PageProperty } from 'src/app/interfaces/page-list';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { environment as e } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Group } from 'src/app/interfaces/group';
import { TreeNode } from 'primeng/primeng';
import { Job } from 'src/app/interfaces/Job';
import * as uuid from 'uuid';
import { Role } from 'src/app/interfaces/role';
import { Permission } from 'src/app/interfaces/permission';
import { GroupJobAssignment } from 'src/app/interfaces/group-job-assignment';

export declare type AdminListTypes = 'roles' | 'jobs' | 'groups' | 'permissions' | 'genders';
export class AdminListProperties {
  static roles: AdminListTypes = 'roles';
  static jobs: AdminListTypes = 'jobs';
  static groups: AdminListTypes = 'groups';
  static permissions: AdminListTypes = 'permissions';
  static genders: AdminListTypes = 'genders';
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {


  private properties = new Map<AdminListTypes, BehaviorSubject<{ label: string, value: string | number | boolean }[]>>();
  private _groups: BehaviorSubject<{ label: string, value: string | number | boolean }[]> = null;


  public get roles(): BehaviorSubject<{ label: string, value: string | number | boolean }[]> {
    return this.getProperties('roles', 'name');
  }

  public get permissions(): BehaviorSubject<{ label: string, value: string | number | boolean }[]> {
    return this.getProperties('permissions', 'name');
  }

  public get genders(): BehaviorSubject<{ label: string, value: string | number | boolean }[]> {
    return this.getProperties('genders', 'gender_id');
  }

  public get jobs(): BehaviorSubject<{ label: string, value: string | number | boolean }[]> {
    return this.getProperties('jobs');
  }

  public invalidate(type: AdminListTypes) {
    this.properties.delete(type);
  }

  public get groups(): BehaviorSubject<{ label: string, value: string | number | boolean }[]> {
    if (!Boolean(this._groups)) {
      this._groups = new BehaviorSubject<{ label: string, value: string | number | boolean }[]>([]);
      this.httpClient.get<{ label: string, value: string | number | boolean }[]>(`${e.apiUrl}${e.urls.groups}/list-options`)
        .toPromise()
        .then(group => {
          this._groups.next(group);
        });
    }
    return this._groups;
  }

  constructor(private httpClient: HttpClient) {

  }

  public loadUsers(page: number = 1, pageSize: number = 20, sortFields: { type: string, value: string }[],
    order: number = 1): Observable<PageList<User>> {
    const params = this.createListParams(page, pageSize, sortFields, order);
    const headers = new HttpHeaders().set('load-type', 'sync');
    return this.httpClient.get<PageList<User>>(`${e.apiUrl}${e.urls.users}?expand=job,role,group`,
      { params, headers }).pipe(map(list => {
        if (!Boolean(list)) {
          return this.createEmptyList<User>();
        }
        if (!Boolean(list.items)) {
          list.items = [] as User[];
        }
        return list;
      }));
  }

  public loadUser(id: number): Observable<User> {
    return this.httpClient.get<User>(`${e.apiUrl}${e.urls.users}/${id}?expand=job,role,group`);
  }

  public deleteUsers(ids: number[]): Observable<any> {
    const contentType = 'application/x-www-form-urlencoded';

    const header = new HttpHeaders().set('Content-Type', contentType);
    // const params: URLSearchParams = new URLSearchParams();
    // ids.forEach(id => params.append('ids[]', id.toString()));
    return this.httpClient.post(`${e.apiUrl}${e.urls.users_delete}`, { ids });
  }

  public createUser(user: User): Observable<{ success: boolean, id: number }> {
    const contentType = 'application/x-www-form-urlencoded';
    const header = new HttpHeaders(contentType);
    const formData = this.createUserFormData(user);
    return this.httpClient.post<{ success: boolean, id: number }>(`${e.apiUrl}${e.urls.users}`, formData, { headers: header });
  }

  public editUser(user: User): Observable<{ success: boolean, id: number }> {
    const contentType = 'application/x-www-form-urlencoded';
    const header = new HttpHeaders(contentType);
    const formData = this.createUserFormData(user);
    return this.httpClient.put<{ success: boolean, id: number }>(`${e.apiUrl}${e.urls.users}/${user.id}`, formData, { headers: header });
  }

  public isEmailExists(email: string): Observable<boolean> {
    const contentType = 'application/x-www-form-urlencoded';

    const header = new HttpHeaders().set('Content-Type', contentType);
    const params: URLSearchParams = new URLSearchParams();
    params.append('email', email);
    return this.httpClient.post<boolean>(`${e.apiUrl}${e.urls.email_check}`, params.toString(), { headers: header });
  }

  public getProperties(type: AdminListTypes, id: string = 'id', urlPostTag: string = '')
    : BehaviorSubject<{ label: string, value: string | number | boolean }[]> {
    if (!this.properties.has(type)) {
      const list = new BehaviorSubject<{ label: string, value: string | number | boolean }[]>
        ([] as { label: string, value: string | number | boolean }[]);
      this.properties.set(type, list);
      this.httpClient.get<PageList<{ name: string, id: string | number | boolean }>>(`${e.apiUrl}${e.urls[type]}${urlPostTag}?per-page=0`)
        .toPromise()
        .then(p => {
          const items: { label: string, value: string | number | boolean }[] = [];
          p.items.forEach(i => items.push({ label: i.name, value: i[id] }));
          return items;
        })
        .then(p => {
          this.properties.get(type).next(p);
        });
    }
    return this.properties.get(type);
  }

  public createProperty(type: AdminListTypes, property: { label: string, value: string | number | boolean })
    : Observable<{ label: string, value: string | number | boolean }> {
    return this.convertProperty(this.httpClient.post<{ label: string, id: string | number | boolean }>
      (`${e.apiUrl}${e.urls[type]}`, property));
  }

  public editProperty(type: AdminListTypes, property: { label: string, value: string | number | boolean })
    : Observable<{ label: string, value: string | number | boolean }> {
    return this.convertProperty(this.httpClient.put<{ label: string, id: string | number | boolean }>
      (`${e.apiUrl}${e.urls[type]}`, property));
  }

  public loadProperty(type: AdminListTypes, value: string | number | boolean)
    : Observable<{ label: string, value: string | number | boolean }> {
    return this.httpClient.get<{ label: string, id: string | number | boolean }>(`${e.apiUrl}${e.urls[type]}/${value}`)
      .pipe(map(p => {
        return {
          label: p.label,
          value: p.id
        } as { label: string, value: string | number | boolean };
      }));
  }

  public deleteProperty(type: AdminListTypes, value: string | number | boolean): Observable<any> {
    return this.httpClient.delete(`${e.apiUrl}${e.urls[type]}/${value}`);
  }

  public createRole(name: string, permissions: string[])
    : Observable<boolean> {
    return this.httpClient.post<boolean>
      (`${e.apiUrl}${e.urls[AdminListProperties.roles]}`, {
        name,
        permissions
      });
  }

  public editRole(name: string, newName: string, permissions: string[])
    : Observable<boolean> {
    return this.httpClient.put<boolean>
      (`${e.apiUrl}${e.urls[AdminListProperties.roles]}`, {
        name,
        newName,
        permissions
      });
  }

  public loadRole(name: string | number | boolean): Observable<Role> {
    return this.httpClient.get<Role>(`${e.apiUrl}${e.urls[AdminListProperties.roles]}/${name}`);
  }

  public loadRoles(): Observable<PageList<Role>> {
    const headers = new HttpHeaders().set('load-type', 'sync');
    return this.httpClient
      .get<PageList<{ name: string, permissions: object }>>(`${e.apiUrl}${e.urls[AdminListProperties.roles]}?per-page=0`, { headers })
      .pipe(map(r => {
        const items = [] as Role[];
        r.items.forEach(i => {
          items.push({
            name: i.name,
            value: uuid.v4(),
            permissions: this.convertRolePermissions(i.permissions)
          });
          r.items = items;
        });
        return {
          _links: r._links,
          _meta: r._meta,
          items
        } as PageList<Role>;
      }));
  }

  private convertRolePermissions(permissions: object): Permission[] {
    const array = [] as Permission[];
    for (const name in permissions) {
      if (!Boolean(name)) {
        continue;
      }
      array.push(permissions[name]);
    }
    return array;
  }

  public loadGroupChildren(id: number): Observable<Group[]> {
    return this.httpClient.get<PageList<Group>>(`${e.apiUrl}${e.urls.groups}/childs/${id}?expand=jobs,groupJobs,user_count`)
      .pipe(map(page => {
        return page.items;
      }));
  }

  public loadOrganizationGroups(): Observable<Group[]> {
    const headers = new HttpHeaders().set('load-type', 'sync');
    return this.httpClient.get<PageList<Group>>(`${e.apiUrl}${e.urls.groups}?expand=jobs,groupJobs,user_count&filter[type]=1`, { headers })
      .pipe(map(page => {
        return page.items;
      }));
  }

  public loadStudentGroups(): Observable<Group[]> {
    const headers = new HttpHeaders().set('load-type', 'sync');

    return this.httpClient.get<PageList<Group>>(`${e.apiUrl}${e.urls.groups}?expand=jobs,groupJobs,user_count&filter[type]=2`, { headers })
      .pipe(map(page => {
        return page.items;
      }));
  }

  public loadGroup(id: number): Observable<Group> {
    return this.httpClient.get<Group>(`${e.apiUrl}${e.urls.groups}/${id}?expand=jobs`);
  }

  public deleteGroup(id: number): Observable<any> {
    return this.httpClient.delete(`${e.apiUrl}${e.urls.groups}/${id}`);
  }

  public editGroup(group: Group): Observable<boolean> {
    return this.httpClient.put<boolean>(`${e.apiUrl}${e.urls.groups}/${group.id}`, group);
  }

  public createGroup(group: Group): Observable<boolean> {
    return this.httpClient.post<boolean>(`${e.apiUrl}${e.urls.groups}`, group);
  }

  public editJob(job: Job): Observable<Job> {
    return this.httpClient.put<Job>(`${e.apiUrl}${e.urls[AdminListProperties.jobs]}/${job.id}`, job);
  }

  public createJob(job: Job): Observable<Job> {
    return this.httpClient.post<Job>(`${e.apiUrl}${e.urls[AdminListProperties.jobs]}`, job);
  }

  public loadJobs(): Observable<PageList<Job>> {
    const headers = new HttpHeaders().set('load-type', 'sync');
    return this.httpClient.get<PageList<Job>>(`${e.apiUrl}${e.urls[AdminListProperties.jobs]}?per-page=0`, { headers });
  }

  public loadJob(id: number): Observable<PageList<Job>> {
    return this.httpClient.get<PageList<Job>>(`${e.apiUrl}${e.urls[AdminListProperties.jobs]}/${id}?per-page=0`);
  }

  private createEmptyList<T>(): PageList<T> {
    return {
      items: [] as T[],
      _meta: {
        totalCount: 0,
        currentPage: 0,
        pageCount: 1,
        perPage: 20,
      } as PageProperty
    } as PageList<T>;
  }

  private createListParams(page: number = 1, pageSize: number = 20,
    sortFields: { type: string, value: string }[], order: number = 1): HttpParams {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per-page', pageSize.toString());
    if (Boolean(sortFields)) {
      sortFields.forEach(field => {
        params = params.append(`filter[${field.type}]`, field.value);
      });
      params = params.append('order', (order === 1 ? '1' : '0'));
    }
    return params;
  }

  private convertProperty(property: Observable<{ label: string, id: string | number | boolean }>)
    : Observable<{ label: string, value: string | number | boolean }> {
    return property.pipe(map(p => {
      return {
        label: p.label,
        value: p.id
      } as { label: string, value: string | number | boolean };
    }));
  }

  public convertTreeNodeToGroup(node: TreeNode): Group {
    return {
      name: node.data.name,
      parent_id: Boolean(node.parent) ? node.parent.data.id : undefined,
      id: node.data.id,
      short_name: node.data.short_name,
      created_at: node.data.created_at,
      external_id: node.data.external_id,
      level: node.data.level,
      type: node.data.type,
      updated_at: node.data.updated_at,
      user_count: node.data.user_count,
      jobs: (node.data.jobs[0] as TreeNode).children.map(job => this.convertTreeNodeToJob(job)),
      groupJobs: (node.data.jobs[0] as TreeNode).children.map(job => this.convertTreeNodeToGroupJob(job)),
    };
  }

  public convertTreeNodeToJob(node: TreeNode): Job {
    const job = { ...node.data };
    delete job.job_id;
    delete job.assigned_role;
    delete job.min_user_assign_role;
    return node.data;
  }

  public convertTreeNodeToGroupJob(node: TreeNode): GroupJobAssignment {
    return {
      assigned_role: node.data.assigned_role,
      job_id: node.data.job_id,
      min_user_assign_role: node.data.min_user_assign_role
    } as GroupJobAssignment;
  }

  public convertGroupToTreeNode(group: Group, parent: TreeNode = null): TreeNode {
    return {
      data: {
        parent,
        name: group.name,
        level: group.level,
        type: group.type,
        short_name: group.short_name,
        user_count: group.user_count,
        id: group.id,
        parent_id: Boolean(parent) ? parent.data.id : undefined,
        row_id: uuid.v4(),
        jobs: [{
          data: {
            disabled: true,
            leaf: false
          },
          children: Object.keys(group.groupJobs).map(key => this.convertJobToTreeNode((group.jobs as Job[])
            .find(j => (j as Job).id === group.groupJobs[key].job_id), group.groupJobs[key]))
        } as TreeNode],
      },
      leaf: false
    };
  }

  private convertJobToTreeNode(job: Job, groupJob: GroupJobAssignment): TreeNode {
    return {
      data: { ...job, ...groupJob },
      children: []
    };
  }

  private createUserFormData(user: User): FormData {
    const formData = new FormData();
    for (const name in user) {
      if (name === 'passwordAgain' || name === 'password') {
        continue;
      }
      if (name === 'job') {
        formData.append('job_id', user.job.toString());
        continue;
      }
      if (name === 'group') {
        formData.append('group_id', user.group.toString());
        continue;
      }
      if (name === 'id' && !Boolean(user[name])) {
        continue;
      }
      if (name === 'role') {
        formData.append('role_name', user[name]);
        continue;
      }
      formData.append(name, user[name]);
    }
    return formData;

  }

}
