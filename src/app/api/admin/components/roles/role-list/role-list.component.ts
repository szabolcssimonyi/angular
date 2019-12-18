import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ComponentBase } from 'src/app/page/components/component-base';
import { PageList } from 'src/app/interfaces/page-list';
import { RoleComponent } from '../role/role.component';
import { AdminService, AdminListProperties } from '../../../services/admin.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/primeng';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Role } from 'src/app/interfaces/role';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent extends ComponentBase implements OnInit {

  public list: PageList<Role> = {
    items: [] as Role[],
    _meta: {
      currentPage: 1,
      pageCount: 1,
      perPage: 20,
      totalCount: 20
    }
  } as PageList<Role>;
  public columns = [];
  public selected: Role = null;
  public dialogVisible = false;
  @ViewChild('dialog', { static: false }) dialog: RoleComponent;

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    private confirmationService: ConfirmationService,
    protected messageService: MessageService,
    private changeDetector: ChangeDetectorRef) {
    super(userService, pageService, translateService, router);
  }

  ngOnInit() {
    this.pageService.headerText.next('ROLE.LIST.TITLE');
    super.ngOnInit();
    this.setColumns();
    this.load();
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => this.setColumns()));
  }

  private setColumns() {
    this.columns = [
      { field: 'name', header: this.translateService.instant('ROLE.LIST.NAME') },
    ];
  }

  public load() {
    this.subscriptions.push(this.adminService.loadRoles()
      .subscribe(list => {
        this.setColumns();
        this.list = list;
        this.changeDetector.detectChanges();
      }));
  }

  public delete() {
    if (!Boolean(this.selected)) {
      return;
    }

    this.confirmationService.confirm({
      message: `${this.translateService.instant('ROLE.LIST.ARE_YOU_SURE_TO_DELETE')}: ${this.selected.name}`,
      accept: () => {
        this.adminService.deleteProperty(AdminListProperties.roles, this.selected.name)
          .toPromise()
          .then(() => {
            this.list.items = this.list.items
              .filter(i => i.name !== this.selected.name);
            this.adminService.invalidate(AdminListProperties.roles);
            this.selected = null;
            this.messageService.add({
              key: 'global',
              severity: 'success',
              summary: this.translateService.instant('ROLE.LIST.DELETE_SUCCESS_TITLE'),
              detail: `${this.translateService.instant('ROLE.LIST.DELETE_SUCCESS_DETAIL')}`
            });
          });
      }
    });
  }

  public showAddDialog() {
    this.dialog.role = {} as Role;
    this.dialogVisible = true;
  }

  public showEditDialog() {
    this.dialog.role = this.selected;
    this.dialogVisible = true;
  }

  public closeDialog() {
    this.dialogVisible = false;
  }

  public edit(role: Role) {
    for (let i = 0; i < this.list.items.length; i++) {
      if (this.list.items[i].value === role.value) {
        this.list.items[i] = role;
        this.adminService.invalidate(AdminListProperties.roles);
      }
    }
  }

  public add(role: Role) {
    this.list.items = [...[role], ...this.list.items];
    this.adminService.invalidate(AdminListProperties.roles);
  }

  public changeSelection($event) {
    console.log(this.selected);
  }

}
