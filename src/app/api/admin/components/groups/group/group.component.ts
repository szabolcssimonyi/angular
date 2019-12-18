import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ComponentBase } from 'src/app/page/components/component-base';
import { UserService } from 'src/app/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Group } from 'src/app/interfaces/group';
import { GroupJobAssignment } from 'src/app/interfaces/group-job-assignment';
import { v4 as uuid } from 'uuid';
import { GroupType } from 'src/app/interfaces/types';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-groups',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupsComponent extends ComponentBase implements OnInit {

  @Output() cancel = new EventEmitter();
  @Output() create = new EventEmitter<Group>();
  @Output() edit = new EventEmitter<Group>();

  public get isFormValid(): boolean {
    return this.form.valid
      && !(this.form.get('jobs') as FormArray).controls.some(c => !c.valid);
  }

  public set group(group: Group) {
    if (!Boolean(group.parent_id)) {
      group.parent_id = 0;
    }
    this.createGroups();
    this.form.patchValue(group);
    if (!Boolean(group.id)) {
      this.title = this.translateService.instant('GROUPS.ADD_TITLE');
      this.isEdit = false;
    } else {
      this.title = `${this.translateService.instant('GROUPS.EDIT_TITLE')}: ${group.name}`;
      this.isEdit = true;
      this.form.patchValue(group);
      group.groupJobs.forEach(j => this.addJob(j));
    }
  }

  public form: FormGroup;
  public title: string;
  public isEdit = false;
  public jobs: SelectItem[] = [];
  public roles: { label: string, value: string | number | boolean }[] = [];
  public columns = [];
  public selectedJob = null;
  public type = GroupType.Organization;

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    private activeRoute: ActivatedRoute,
    protected messageService: MessageService,
    private builder: FormBuilder) {
    super(userService, pageService, translateService, router);
    this.type = this.activeRoute.snapshot.data.type;
    this.createGroups();
    if (Boolean(this.translateService.currentLang)) {
      this.loadProperties();
      this.setColumns();
    }
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => {
      this.loadProperties();
      this.setColumns();
    }));
  }

  ngOnInit() {
    super.ngOnInit();
  }

  private setColumns() {
    this.columns = [
      { field: 'shortjob_id_name', header: this.translateService.instant('JOB.LIST.NAME') },
      { field: 'assigned_role', header: this.translateService.instant('JOB.LIST.ASSIGNED_ROLE') },
      { field: 'min_user_assign_role', header: this.translateService.instant('JOB.LIST.MIN_USER_ROLE_ASSIGNED') },
    ];
  }

  private createGroups(): void {
    this.form = this.builder.group({
      id: [0],
      parent_id: [0],
      created_at: [''],
      updated_at: [''],
      level: [0],
      type: [1],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)]],
      short_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(16)]],
      jobs: this.builder.array([])
    });
  }

  private isSelectedValidator(control: FormControl): { [key: string]: any } {
    return !Boolean(control) || !Boolean(control.value) || control.value.length === 0 ? { notselected: true } : null;
  }

  public onSave() {
    const group = this.form.value as Group;
    group.jobs = (this.form.get('jobs') as FormArray).controls.map(g => {
      const data = { ...g.value };
      delete data.row_id;
      return data;
    });
    group.type = this.type;
    const subscription = this.isEdit
      ? this.adminService.editGroup(group)
      : this.adminService.createGroup(group);
    const eventHandler = this.isEdit ? this.edit : this.create;
    subscription.subscribe(result => {
      this.messageService.add({
        key: 'global',
        severity: Boolean(result) ? 'success' : 'error',
        summary: this.translateService.instant(this.isEdit ? 'GROUPS.EDIT_RESULT' : 'GROUPS.CREATE_RESULT'),
        detail: this.translateService.instant(Boolean(result) ? 'GROUPS.SAVE_SUCCESS_TITLE' : 'GROUPS.SAVE_ERROR_TITLE')
      });
      eventHandler.emit(group);
      this.cancel.emit();
    });
  }

  public onCancel() {
    this.group = {} as Group;
    this.cancel.emit();
  }

  public formJob(index: number, propertyName: string): FormControl {
    const group = (this.form.get('jobs') as FormArray).controls[index] as FormGroup;
    const control = group.controls[propertyName] as FormControl;
    return control;
  }

  private loadProperties() {
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

  public addJob(job: GroupJobAssignment) {
    const jobs = this.form.get('jobs') as FormArray;
    jobs.controls = [...jobs.controls, this.builder.group({
      row_id: uuid(),
      job_id: [job.job_id || 0, [this.isSelectedValidator]],
      assigned_role: [job.assigned_role || false, [this.isSelectedValidator]],
      min_user_assign_role: [job.min_user_assign_role || 1, [Validators.required, Validators.min(1)]]
    })];
    this.setJobSelection();
  }

  public createJob() {
    const job = {} as GroupJobAssignment;
    this.addJob(job);
  }

  public deleteJob() {
    if (!Boolean(this.selectedJob)) {
      return;
    }
    (this.form.get('jobs') as FormArray).controls = (this.form.get('jobs') as FormArray)
      .controls.filter(j => j.get('row_id').value !== this.selectedJob.get('row_id').value);
    this.setJobSelection();
  }

  public jobChanged(e) {
    this.setJobSelection();
  }

  public areJobsFull() {
    return (this.form.get('jobs') as FormArray).controls.length === 0;
  }

  public getJobControls() {
    return (this.form.get('jobs') as FormArray).controls;
  }

  private setJobSelection() {
    const ids = (this.form.get('jobs') as FormArray).controls.map(j => j.value.job_id as number);
    const jobs = [...this.jobs.map(j => {
      const item = (j as SelectItem);
      item.disabled = ids.some(id => id === j.value);
      return item;
    })];

    this.jobs = jobs;
  }
  public jobSelectable() {
    return this.jobs.some(j => !j.disabled)
      && (this.form.get('jobs') as FormArray).controls.length < this.jobs.length - 1;
  }

}
