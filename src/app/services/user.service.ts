import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { User } from '../interfaces/user';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment as e } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Token } from '../interfaces/token';
import { TokenService } from './token.service';
import { PagePermission } from '../interfaces/page-permission';
import { camelCase, startCase } from 'lodash';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private _user: BehaviorSubject<User> = null;
  private _triggerAdvancesSearchSubject = new Subject<boolean>();
  private default = { id: 0, permissions: [], role: 'Guest', username: 'N/A', lang: { code: 'hu', name: '', id: 0 } } as User;
  private _permissions: PagePermission[] = [];
  private defaultLang = { code: 'hu', name: '', id: 0 };

  public get user(): BehaviorSubject<User> {
    if (Boolean(this._user)) {
      return this._user;
    }
    this._user = new BehaviorSubject<User>(this.default);
    if (!this.tokenService.isValid()) {
      this.clear();
      return this._user;
    }
    this.load();
    return this._user;
  }

  public get permissions(): PagePermission[] {
    return this._permissions;
  }

  public get triggerAdvancedSearch(): Subject<boolean> {
    return this._triggerAdvancesSearchSubject;
  }

  constructor(
    private client: HttpClient,
    private router: Router,
    private tokenService: TokenService) { }

  public login(email: string, password: string): Observable<false | Token> {
    const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params: URLSearchParams = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    return this.client
      .post<any>(`${e.apiUrl}${e.urls.login}`,
        params.toString(),
        { headers: header })
      .pipe(map(t => {
        if (this.tokenService.isToken(t)) {
          this.tokenService.set(t);
        }
        return this.tokenService.get() as Token;
      }));
  }

  public requestPasswordReset(email: string): Observable<void> {
    const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params: URLSearchParams = new URLSearchParams();
    params.append('email', email);
    return this.client.post<void>(`${e.apiUrl}${e.urls.password_reset}`,
      params.toString(),
      { headers: header });
  }

  public load() {
    if (!this.tokenService.isValid()) {
      return;
    }
    this.client.get<User>(`${e.apiUrl}${e.urls.me}?extend=job,group`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
      }).subscribe(u => {
        this.setPermissions(u.permissions);
        if (!Boolean(u.lang)) {
          u.lang = this.defaultLang;
        }
        this._user.next(u);
      });
  }

  public saveProfile(user: User) {
    delete user.permissions;
    delete user.role;
    delete user.external_id;
    delete user.work_started_date;
    delete user.job;
    delete user.group;
    delete user.active;
    delete user.is_deleted;
    delete user.is_hidden;
    delete user.lang;
    delete user.updated_at;
    delete user.created_at;
    delete user.last_logged_at;
    delete user.email;
    const contentType = 'application/x-www-form-urlencoded';
    const headers = new HttpHeaders(contentType);
    const data = this.createUserFormData(user);
    this.client.post<User>(`${e.apiUrl}${e.urls.me_save}`, data, { headers }).subscribe(u => {
      this.load();
    });

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
      if (name === 'role') {
        formData.append('role_name', user[name]);
        continue;
      }
      formData.append(name, user[name]);
    }
    return formData;

  }


  public setPassword(id: string, password: string, path: string) : Observable<any> {
    const header = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    // const params: URLSearchParams = new URLSearchParams();
    let params = new HttpParams();
    params = params.append('password_repeat', password);
    params = params.append('password', password);
    params = params.append('token', id);
    return this.client
      .post<any>(`${e.apiUrl}${e.urls[path]}`,
        params.toString(),
        { headers: header });
  }

  public clear() {
    this.tokenService.clear();
    this.clearPermissions();
    if (!Boolean(this._user)) {
      this._user = new BehaviorSubject<User>(this.default);
    } else {
      this._user.next(this.default);
    }
  }

  public get isLoggedin(): boolean {
    return this.tokenService.isValid();
  }

  private setPermissions(permissions: string[]) {
    this._permissions = permissions.map(p => {
      const tags = p.split('.');
      if (!Boolean(tags) || tags.length === 0) {
        return {
          action: null,
          modules: []
        } as PagePermission;
      }
      const action = tags.pop();
      const modules = tags;
      return {
        action,
        modules: modules.map(m => `${startCase(camelCase(m)).replace(/ /g, '')}Module`)
      } as PagePermission;
    }).filter(p => Boolean(p.action));
  }

  public hasPermission(module: string, action?: string | string[] | undefined): boolean {
    if (!Boolean(this.permissions)) {
      return false;
    }
    if (Boolean(action)) {
      return this.permissions.some(permission => {
        if (permission.modules.length === 0) {
          return false;
        }
        const m = permission.modules[permission.modules.length - 1];
        return m === module
          && (action instanceof Array ? action.some(a => a === permission.action) : action === permission.action);
      });
    } else {
      return this.permissions.some(permission => permission.modules.some(m => m === module));
    }
  }

  public getPermissions(module?: string): PagePermission[] {
    if (!Boolean(this.permissions)) {
      return [];
    }
    if (!Boolean(module)) {
      return this.permissions;
    }
    return this.permissions.filter(p => p.modules.some(m => m === module));
  }

  private clearPermissions() {
    this._permissions = [];
  }



}
