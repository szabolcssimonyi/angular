import { Component, OnInit, ViewChild } from '@angular/core';
import { PageList } from 'src/app/interfaces/page-list';
import { User } from 'src/app/interfaces/user';
import { ComponentBase } from 'src/app/page/components/component-base';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { environment as e, environment } from 'src/environments/environment';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/primeng';
import { UserComponent } from '../user/user.component';
import { UserSearchComponent } from '../user-search/user-search.component';
import { UserSearch } from 'src/app/interfaces/user-search';
import { Group } from 'src/app/interfaces/group';
import { Job } from 'src/app/interfaces/Job';
import { Table } from 'primeng/table';
import { PageService } from 'src/app/services/page.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent extends ComponentBase implements OnInit {

  public list: PageList<User> = {
    items: [] as User[],
    _meta: {
      currentPage: 1,
      pageCount: 1,
      perPage: 20,
      totalCount: 20
    }
  } as PageList<User>;
  public columns = [];
  public selectedUsers: User[] = [];
  public dialogVisible = false;
  public searchDialogVisible = false;
  public searchData: { label: string, value: string, type: string }[] = [];
  public selectedSearchData: { label: string, value: string, type: string }[] = [];
  public searchProperties = ['username', 'name', 'email', 'job_id', 'group_id', 'role_name'];
  public groups: { label: string, value: string | number | boolean }[] = [];
  public jobs: { label: string, value: string | number | boolean }[] = [];
  public roles: { label: string, value: string | number | boolean }[] = [];
  public states: { label: string, value: string | number | boolean }[] = [];
  public genders: { label: string, value: string | number | boolean }[] = [];

  @ViewChild('dialog', { static: false }) dialog: UserComponent;
  @ViewChild('searchDialog', { static: false }) searchDialog: UserSearchComponent;
  @ViewChild('userTable', { static: false }) userTable: Table;

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    private confirmationService: ConfirmationService,
    protected messageService: MessageService) {
    super(userService, pageService, translateService, router);
  }

  ngOnInit() {
    this.pageService.headerText.next('USER.LIST.TITLE');
    super.ngOnInit();
    this.setColumns();
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => this.setColumns()));
    this.subscriptions.push(this.userService.triggerAdvancedSearch.subscribe(show => this.searchDialogVisible = show));
    this.loadProperties();
  }

  private setColumns() {
    this.columns = [
      { field: 'avatar', header: '' },
      { field: 'username', header: this.translateService.instant('USER.LIST.USERNAME'), userDetail: false },
      { field: 'firstname', header: this.translateService.instant('USER.LIST.FIRSTNAME'), userDetail: true },
      { field: 'lastname', header: this.translateService.instant('USER.LIST.LASTNAME'), userDetail: true },
      { field: 'active', header: this.translateService.instant('USER.LIST.STATUS'), userDetail: true },
      { field: 'role', header: this.translateService.instant('USER.LIST.ROLE'), userDetail: false },
      { field: 'job', header: this.translateService.instant('USER.LIST.POSITION'), userDetail: true },
      { field: 'group', header: this.translateService.instant('USER.LIST.GROUPS_UNIT'), userDetail: true },
      { field: 'email', header: this.translateService.instant('USER.LIST.EMAIL'), userDetail: true },
    ];
  }

  public load($event) {
    this.selectedUsers = [];
    const page = (Number($event.first) / Number($event.rows)) + 1;
    const itemCount = Number($event.rows);
    const sortField = Boolean($event.sortField) ? $event.sortField : null;
    const order = Boolean($event.sortOrder) ? $event.sortOrder : null;
    this.adminService.loadUsers(page, itemCount, sortField, order)
      .toPromise()
      .then(list => {
        list.items = list.items.map(item => {
          item.avatar = Boolean(item.avatar)
            ? `${e.apiHost}${e.apiPort}/${e.urls.avatart}/${item.avatar}`
            : e.paths.avatar;
          if (!Boolean(item.group)) {
            item.group = {} as Group;
          }
          if (!Boolean(item.job)) {
            item.job = {} as Job;
          }
          return item;
        });
        return list;
      }).then(list => {
        this.setColumns();
        this.list = list;
      });
  }

  public isUserDetailSmall(col: { field: string, header: string }) {
    const medium = ['lastname', 'firstname', 'active'];
    return this.columns.find(c => c.field === col.field).userDetail && medium.some(m => m === col.field);
  }

  public isUserDetailMedium(col: { field: string, header: string }) {
    const medium = ['lastname', 'firstname', 'active'];
    return this.columns.find(c => c.field === col.field).userDetail && !medium.some(m => m === col.field);
  }

  public delete() {
    if (!Boolean(this.selectedUsers) || this.selectedUsers.length === 0) {
      return;
    }
    const userNames = this.selectedUsers.map(u => u.username);
    this.confirmationService.confirm({
      message: `${this.translateService.instant('USER.LIST.ARE_YOU_SURE_TO_DELETE')}: ${userNames.join(',')}`,
      accept: () => {
        const ids = [...this.selectedUsers.map(u => u.id)];
        this.adminService.deleteUsers(ids)
          .toPromise()
          .then(() => {
            this.list.items = this.list.items
              .filter(i => !this.selectedUsers
                .map(s => s.id)
                .some(s => s === i.id));
            const count = Boolean(this.selectedUsers) ? this.selectedUsers.length : 0;
            this.selectedUsers = [];
            this.messageService.add({
              key: 'global',
              severity: 'success',
              summary: this.translateService.instant('USER.LIST.DELETE_SUCCESS_TITLE'),
              detail: `${count} ${this.translateService.instant('USER.LIST.DELETE_SUCCESS_DETAIL')}`
            });
          });
      }
    });

  }

  public showAddDialog() {
    this.dialog.user = {} as User;
    this.dialogVisible = true;
  }

  public showEditDialog() {
    this.dialog.user = this.selectedUsers[0];
    this.dialogVisible = true;
  }

  public close() {
    this.dialogVisible = false;
  }

  public edit(user: User) {
    this.selectedUsers = [];
    this.adminService.loadUser(user.id).subscribe(u => {
      for (let i = 0; i < this.list.items.length; i++) {
        if (this.list.items[i].id === Number(user.id)) {
          this.list.items[i] = { ...u };
          this.list.items[i].avatar = Boolean(u.avatar)
            ? `${environment.apiHost}${environment.apiPort}/${environment.urls.avatart}/${u.avatar}`
            : environment.paths.avatar;
        }
      }
    });
  }

  public add(user: User) {
    this.selectedUsers = [];
    this.adminService.loadUser(user.id).subscribe(u => {
      const newUser = { ...u };
      newUser.avatar = Boolean(u.avatar)
        ? `${environment.apiHost}${environment.apiPort}/${environment.urls.avatart}/${u.avatar}`
        : environment.paths.avatar;
      this.list.items = [...[newUser], ...this.list.items];
    });
  }

  private loadProperties() {
    if (!Boolean(this.groups) || this.groups.length === 0) {
      this.subscriptions.push(this.adminService.groups.subscribe(groups => {
        this.groups = [...groups];
      }));
    }
    if (!Boolean(this.jobs) || this.jobs.length === 0) {
      this.subscriptions.push(this.adminService.jobs.subscribe(jobs => {
        this.jobs = [...jobs];
      }));
    }
    if (!Boolean(this.roles) || this.roles.length === 0) {
      this.subscriptions.push(this.adminService.roles.subscribe(roles => {
        this.roles = [...roles];
      }));
    }
    if (!Boolean(this.genders) || this.genders.length === 0) {
      this.subscriptions.push(this.adminService.genders.subscribe(genders => {
        this.genders = [...genders];
      }));
    }
    if (!Boolean(this.states) || this.states.length === 0) {
      this.states = [
        { label: this.translateService.instant('USER.STATE_ACTIVE'), value: 1 },
        { label: this.translateService.instant('USER.STATE_INACTIVE'), value: 0 }
      ];
    }
  }

  public closeSearchDialog() {
    this.searchDialogVisible = false;
  }

  public search(e: UserSearch) {
    console.log('search', e);
    this.searchData = [];
    this.selectedSearchData = [];
    this.setSearchString(e, 'username', 'USER.SEARCH.USERNAME_LABEL');
    this.setSearchString(e, 'name', 'USER.SEARCH.NAME');
    this.setSearchString(e, 'email', 'USER.SEARCH.EMAIL');
    this.setSearchProperty(this.jobs, e.job_id, 'USER.SEARCH.JOB_LABEL', 'job_id');
    this.setSearchProperty(this.roles, e.role_name, 'USER.SEARCH.ROLE_LABEL', 'role_name');
    this.setSearchProperty(this.groups, e.group_id, 'USER.SEARCH.GROUP_LABEL', 'group_id');
    this.searchChanged();
  }

  public setSearchString(obj: any, key: string, name: string) {
    if (!Boolean(obj[key])) {
      return;
    }
    const newItem = {
      label: `${this.translateService.instant(name)}: ${obj[key]}`,
      value: obj[key],
      type: key
    };
    this.searchData.push(newItem);
    this.selectedSearchData.push(newItem);
  }

  public setSearchProperty(list: { label: string, value: string | number | boolean }[],
    item: any, name: string, type: string, translate: boolean = false) {
    if (item === undefined || item === null) {
      return;
    }
    const find = list.find(j => j.value === item);
    if (find === undefined) {
      return;
    }
    const label = translate ? this.translateService.instant(find.label) : find.label;
    const selectItem = {
      label: `${this.translateService.instant(name)}: ${label}`,
      value: find.value as string,
      type
    };
    this.searchData.push(selectItem);
    this.selectedSearchData.push(selectItem);
  }

  public searchChanged() {
    this.load({
      sortOrder: this.userTable.sortOrder,
      first: this.userTable.first,
      sortField: this.selectedSearchData,
      rows: this.userTable.rows
    });
  }

  public clearSearch() {
    this.searchData = [];
    this.selectedSearchData = [];
    this.searchDialog.form.reset();
    this.load({
      sortOrder: this.userTable.sortOrder,
      first: this.userTable.first,
      sortField: this.selectedSearchData,
      rows: this.userTable.rows
    });
  }

}
