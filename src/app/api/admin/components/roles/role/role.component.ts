import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ComponentBase } from 'src/app/page/components/component-base';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MessageService, TreeNode, Tree } from 'primeng/primeng';
import { Role } from 'src/app/interfaces/role';
import { Permission } from 'src/app/interfaces/permission';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent extends ComponentBase implements OnInit {


  @Output() cancel = new EventEmitter();
  @Output() create = new EventEmitter<Role>();
  @Output() edit = new EventEmitter<Role>();

  @ViewChild('permissionTree', { static: false }) permissionTree: Tree;

  public tree = [] as TreeNode[];
  public permissionList = [] as TreeNode[];

  public set role(role: Role) {
    this.form.reset();
    this._role = role;
    this.selectedPermissions = [];
    if (!Boolean(role) || !Boolean(role.name)) {
      this.setFormForCreate();
      return;
    }
    this.setformForEdit(role);
  }

  public get role(): Role {
    return this.form.value as Role;
  }

  private _role = {} as Role;

  public get isFormValid(): boolean {
    return this.form.valid;
  }

  public form: FormGroup;
  public title: string;
  public isEdit = false;
  public permissions: { label: string, value: string | number | boolean }[] = [];
  public selectedPermissions = [] as TreeNode[];

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    protected messageService: MessageService,
    private builder: FormBuilder) {
    super(userService, pageService, translateService, router);
    this.createGroups();
    if (Boolean(this.translateService.currentLang)) {
      this.loadProperties();
    }
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => {
      this.loadProperties();
    }));
  }

  ngOnInit() {
    super.ngOnInit();
  }

  private setFormForCreate() {
    this.title = this.translateService.instant('ROLE.ADD_TITLE');
    this.isEdit = false;
  }

  private setformForEdit(role: Role) {
    this.isEdit = true;
    this.title = this.translateService.instant('ROLE.EDIT_TITLE');
    this.form.patchValue(role);
    this.selectedPermissions = this.permissionList.filter(p => role.permissions.some(rp => rp.name === p.data.value));
  }

  private createGroups(): void {
    this.form = this.builder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(24)]],
    });
  }

  public onCancel() {
    this.cancel.emit();
  }

  public onSave() {
    const selectedPermissions = this.readPermissions();
    const role = this.form.value as Role;
    const subscribe = this.isEdit
      ? this.adminService.editRole(this._role.name, role.name, selectedPermissions)
      : this.adminService.createRole(role.name, selectedPermissions);
    subscribe.subscribe(r => {
      this.messageService.add({
        key: 'global',
        severity: Boolean(r) ? 'success' : 'error',
        summary: this.translateService.instant(this.isEdit ? 'ROLE.EDIT_RESULT' : 'ROLE.CREATE_RESULT'),
        detail: this.translateService.instant(Boolean(r) ? 'ROLE.SAVE_SUCCESS_TITLE' : 'ROLE.SAVE_ERROR_TITLE')
      });
      role.value = this._role.value;
      role.permissions = this.selectedPermissions.map(p => {
        return {
          name: p.data.value,
        } as Permission;
      });
      if (this.isEdit) {
        this.edit.emit(role);
      } else {
        this.create.emit(role);
      }
      this.cancel.emit();
    });
  }

  private loadProperties() {
    if (!Boolean(this.permissions) || this.permissions.length === 0) {
      this.subscriptions.push(this.adminService.permissions.subscribe(permissions => {
        this.permissions = [...permissions];
        this.parsePermissions();
      }));
    }
  }

  private readPermissions(): string[] {
    return this.selectedPermissions.filter(p => p.children.length === 0).map(p => p.data.value);
  }

  private parsePermissions() {
    this.permissions.forEach(p => {
      const tags = (p.value as string).split('.');
      let tag: string = null;
      let pos = this.tree;
      while (Boolean((tag = tags.shift()))) {
        let cur = pos.find(t => t.data.name === tag);
        if (!Boolean(cur)) {
          cur = {
            label: tag,
            data: { name: tag, value: p.value },
            children: []
          };
          pos.push(cur);
        }
        pos = cur.children;
      }
    });
    this.tree.forEach(t => this.findPermissionTrees(t));
  }

  private findPermissionTrees(tree: TreeNode) {
    if (tree.children.length === 0) {
      this.permissionList.push(tree);
    } else {
      tree.children.forEach(t => this.findPermissionTrees(t));
    }
  }
}
