import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ComponentBase } from 'src/app/page/components/component-base';
import { AdminService } from '../../../services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/primeng';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserSearch } from 'src/app/interfaces/user-search';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent extends ComponentBase implements OnInit {

  @Output() search = new EventEmitter<UserSearch>();
  @Output() cancel = new EventEmitter<void>();

  public groups: { label: string, value: string | number | boolean }[] = [];
  public jobs: { label: string, value: string | number | boolean }[] = [];
  public roles: { label: string, value: string | number | boolean }[] = [];
  public title = '';
  public form: FormGroup;

  public get isUserFormValid() {
    const search = this.form.value as UserSearch;
    return Object.keys(search).some(key => search[key] !== false
      && search[key] !== undefined
      && search[key] !== null
      && search[key] !== '');
  }

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
      this.title = this.translateService.instant('USER.SEARCH.TITLE');
    }));
  }

  ngOnInit() {
  }

  private createGroups(): void {
    this.form = this.builder.group({
      username: '',
      name: '',
      email: '',
      group_id: ['', []],
      job_id: ['', []],
      role_name: ['', []],
    });
  }

  public onSearch() {
    this.search.emit(this.form.value);
    this.cancel.emit();
  }

  private loadProperties() {
    if (!Boolean(this.groups) || this.groups.length === 0) {
      this.subscriptions.push(this.adminService.groups.subscribe(groups => {
        this.groups = [...[{ label: this.translateService.instant('USER.SELECT_UNIT'), value: false }], ...groups];
      }));
    }
    if (!Boolean(this.jobs) || this.jobs.length === 0) {
      this.subscriptions.push(this.adminService.jobs.subscribe(jobs => {
        this.jobs = [...[{ label: this.translateService.instant('USER.SELECT_JOB'), value: false }], ...jobs];
      }));
    }
    if (!Boolean(this.roles) || this.roles.length === 0) {
      this.subscriptions.push(this.adminService.roles.subscribe(roles => {
        this.roles = [...[{ label: this.translateService.instant('USER.SELECT_ROLE'), value: false }], ...roles];
      }));
    }
  }

  public onCancel() {
    this.cancel.emit();
  }

}
