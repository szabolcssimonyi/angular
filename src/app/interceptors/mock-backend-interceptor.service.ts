import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor, HttpResponse, HTTP_INTERCEPTORS
} from '@angular/common/http';
import { UserService } from '../services/user.service';
import { MessageService } from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { environment } from 'src/environments/environment.prod';
import { PageList } from '../interfaces/page-list';
import { Group } from '../interfaces/group';

const users: User[] = [{
  id: 1,
  username: 'admin user',
  firstname: 'Test',
  lastname: 'User',
  role: 'Admin',
  email: 'admin@test.com',
  permissions: [
    'admin.users.view',
    'admin.users.create',
    'admin.users.edit',
    'admin.users.delete',
    'admin.roles.view',
    'admin.roles.create',
    'admin.roles.edit',
    'admin.roles.delete'
  ]
}] as User[];

const userList = {
  items: [
    {
      id: 1,
      username: 'admin',
      firstname: 'Admin',
      lastname: 'Admin',
      email: 'admin@test.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'en', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565811344,
      created_at: null,
      updated_at: null,
      role: 'admin',
      permissions: [
        'admin.users.view',
        'admin.users.create',
        'admin.users.edit',
        'admin.users.delete',
        'admin.roles.view',
        'admin.roles.create',
        'admin.roles.edit',
        'admin.roles.delete'],
      group: {} as Group
    },
    {
      id: 2,
      username: 'polakdavid',
      firstname: 'Dávid',
      lastname: 'Polák',
      email: 'poda5d2@gmail.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'hu', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565014548,
      created_at: null,
      updated_at: null,
      role: 'user',
      group: {} as Group,
      permissions: []
    },
    {
      id: 3,
      username: 'polakdavid',
      firstname: 'Dávid',
      lastname: 'Polák',
      email: 'poda5d2@gmail.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'hu', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565014548,
      created_at: null,
      updated_at: null,
      role: 'user',
      group: {} as Group,
      permissions: []
    },
    {
      id: 4,
      username: 'john_doe',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@johndoe.com',
      tel: null,
      active: 0,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'hu', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 1,
      last_logged_at: 1565012180,
      created_at: null,
      updated_at: null,
      role: 'user',
      permissions: [],
      group: {} as Group
    },
    {
      id: 5,
      username: 'polakdavid',
      firstname: 'Dávid',
      lastname: 'Polák',
      email: 'poda5d2@gmail.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'en', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565014548,
      created_at: null,
      updated_at: null,
      role: 'user',
      group: {} as Group,
      permissions: []
    },
    {
      id: 6,
      username: 'polakdavid',
      firstname: 'Dávid',
      lastname: 'Polák',
      email: 'poda5d2@gmail.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'hu', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565014548,
      created_at: null,
      updated_at: null,
      role: 'user',
      group: {} as Group,
      permissions: []
    },
    {
      id: 7,
      username: 'polakdavid',
      firstname: 'Dávid',
      lastname: 'Polák',
      email: 'poda5d2@gmail.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'hu', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565014548,
      created_at: null,
      updated_at: null,
      role: 'user',
      group: {} as Group,
      permissions: []
    },
    {
      id: 8,
      username: 'polakdavid',
      firstname: 'Dávid',
      lastname: 'Polák',
      email: 'poda5d2@gmail.com',
      tel: null,
      active: 1,
      gender_id: 0,
      avatar: null,
      work_started_date: null,
      lang: { code: 'hu', name: '', id: 0 },
      is_hidden: 0,
      is_deleted: 0,
      last_logged_at: 1565014548,
      created_at: null,
      updated_at: null,
      role: 'user',
      group: {} as Group,
      permissions: []
    },
  ],
  _links: {
    self: {
      href: 'http://localhost:8080/api/users?page=1'
    }
  },
  _meta: {
    totalCount: 100,
    pageCount: 1,
    currentPage: 1,
    perPage: 20
  }
} as PageList<User>;

@Injectable({
  providedIn: 'root'
})
export class MockBackendInterceptorService implements HttpInterceptor {

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith('/email-exists') && method === 'POST':
          return ok(body === 'email=admin%40test.com');
        // case url.endsWith('groups/childs/1?expand=jobs') && method === 'GET':
        //   return ok({
        //     'items': [
        //       {
        //         'id': 2,
        //         'type': 2,
        //         'name': 'Teszt tanuló csoport1',
        //         'short_name': 'TLG1',
        //         'external_id': null,
        //         'level': 2,
        //         'created_at': null,
        //         'updated_at': null,
        //         'jobs': [
        //           {
        //             "id": 1,
        //             "name": "Teszt munkakör1",
        //             "short_name": "TM",
        //             "external_id": null,
        //             "assigned_role": null,
        //             "min_user_assign_role": null,
        //             "created_at": null,
        //             "updated_at": null
        //           },
        //           {
        //             "id": 2,
        //             "name": "Teszt munkakör2",
        //             "short_name": "TM",
        //             "external_id": null,
        //             "assigned_role": null,
        //             "min_user_assign_role": null,
        //             "created_at": null,
        //             "updated_at": null
        //           }
        //         ]
        //       },
        //       {
        //         'id': 3,
        //         'type': 2,
        //         'name': 'Teszt tanuló csoport2',
        //         'short_name': 'TLG2',
        //         'external_id': null,
        //         'level': 2,
        //         'created_at': null,
        //         'updated_at': null,
        //         'jobs': [{
        //           "id": 1,
        //           "name": "Teszt munkakör1",
        //           "short_name": "TM",
        //           "external_id": null,
        //           "assigned_role": null,
        //           "min_user_assign_role": null,
        //           "created_at": null,
        //           "updated_at": null
        //         },
        //         {
        //           "id": 2,
        //           "name": "Teszt munkakör2",
        //           "short_name": "TM",
        //           "external_id": null,
        //           "assigned_role": null,
        //           "min_user_assign_role": null,
        //           "created_at": null,
        //           "updated_at": null
        //         }]
        //       },
        //       {
        //         'id': 4,
        //         'type': 2,
        //         'name': 'Teszt tanuló csoport3',
        //         'short_name': 'TLG3',
        //         'external_id': null,
        //         'level': 2,
        //         'created_at': null,
        //         'updated_at': null,
        //         'jobs': []
        //       }
        //     ],
        //     '_links': {
        //       'self': {
        //         'href': 'http://localhost:8080/api/groups/childs/1?expand=jobs&page=1'
        //       }
        //     },
        //     '_meta': {
        //       'totalCount': 1,
        //       'pageCount': 1,
        //       'currentPage': 1,
        //       'perPage': 20
        //     }
        //   });
        // case url.endsWith('groups/1') && method === 'DELETE':
        // case url.endsWith('groups/2') && method === 'DELETE':
        // case url.endsWith('groups/3') && method === 'DELETE':
        // case url.endsWith('groups/4') && method === 'DELETE':
        // case url.endsWith('groups/5') && method === 'DELETE':
        //   return ok(true);
        // case url.endsWith('groups/childs/2?expand=jobs') && method === 'GET':
        //   return ok({
        //     'items': [
        //       {
        //         'id': 5,
        //         'type': 2,
        //         'name': 'Teszt tanuló csoport1',
        //         'short_name': 'TLG1',
        //         'external_id': null,
        //         'level': 2,
        //         'created_at': null,
        //         'updated_at': null,
        //         'jobs': [
        //           {
        //             "id": 1,
        //             "name": "Teszt munkakör1",
        //             "short_name": "TM",
        //             "external_id": null,
        //             "assigned_role": null,
        //             "min_user_assign_role": null,
        //             "created_at": null,
        //             "updated_at": null
        //           },
        //           {
        //             "id": 2,
        //             "name": "Teszt munkakör2",
        //             "short_name": "TM",
        //             "external_id": null,
        //             "assigned_role": null,
        //             "min_user_assign_role": null,
        //             "created_at": null,
        //             "updated_at": null
        //           }
        //         ]
        //       },
        //       {
        //         'id': 6,
        //         'type': 2,
        //         'name': 'Teszt tanuló csoport2',
        //         'short_name': 'TLG2',
        //         'external_id': null,
        //         'level': 2,
        //         'created_at': null,
        //         'updated_at': null,
        //         'jobs': [{
        //           "id": 1,
        //           "name": "Teszt munkakör1",
        //           "short_name": "TM",
        //           "external_id": null,
        //           "assigned_role": null,
        //           "min_user_assign_role": null,
        //           "created_at": null,
        //           "updated_at": null
        //         },
        //         {
        //           "id": 2,
        //           "name": "Teszt munkakör2",
        //           "short_name": "TM",
        //           "external_id": null,
        //           "assigned_role": null,
        //           "min_user_assign_role": null,
        //           "created_at": null,
        //           "updated_at": null
        //         }]
        //       }
        //     ],
        //     '_links': {
        //       'self': {
        //         'href': 'http://localhost:8080/api/groups/childs/1?expand=jobs&page=1'
        //       }
        //     },
        //     '_meta': {
        //       'totalCount': 1,
        //       'pageCount': 1,
        //       'currentPage': 1,
        //       'perPage': 20
        //     }
        //   });
        // case url.endsWith('/roles') && method === 'PUT':
        //   return ok({
        //     name: 'Body'
        //   } as { name: string });
        // case url.endsWith('/roles') && method === 'POST':
        //   return ok({
        //     name: 'Body'
        //   } as { name: string });
        default:
          return next.handle(request);
      }
    }

    // route functions

    function authenticate() {
      return ok(users[0]);
    }

    // helper functions

    function ok(body?: any) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function error(message) {
      return throwError({ error: { message } });
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    function isLoggedIn() {
      return headers.get('Authorization') === `Basic ${window.btoa('test:test')}`;
    }
  }
}

export let mockBackendInterceptor = environment.backendProvider
  ? {
    provide: HTTP_INTERCEPTORS,
    useClass: MockBackendInterceptorService,
    multi: true
  }
  : {
    provide: MockBackendInterceptorService,
    useValue: {},
  };
