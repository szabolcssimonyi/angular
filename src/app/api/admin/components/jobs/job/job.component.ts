import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ComponentBase } from 'src/app/page/components/component-base';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Job } from 'src/app/interfaces/Job';
import { AdminService } from '../../../services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/primeng';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent extends ComponentBase implements OnInit {

  @Output() cancel = new EventEmitter();
  @Output() create = new EventEmitter<Job>();
  @Output() edit = new EventEmitter<Job>();

  public set job(job: Job) {
    this.form.reset();
    if (!Boolean(job) || !Boolean(job.id)) {
      this.setFormForCreate();
      return;
    }
    this.setformForEdit(job);
  }

  public get job(): Job {
    return this.form.value as Job;
  }

  public get isFormValide(): boolean {
    return this.form.valid;
  }

  public form: FormGroup;
  public title: string;
  public isEdit = false;
  public roles: { label: string, value: string | number | boolean }[] = [];

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
    this.title = this.translateService.instant('JOB.ADD_TITLE');
    this.isEdit = false;
  }

  private setformForEdit(job: Job) {
    this.isEdit = true;
    this.title = this.translateService.instant('JOB.EDIT_TITLE');
    this.form.patchValue(job);
    this.adminService.loadJob(job.id).subscribe(j => {
      this.form.patchValue(j);
    });
  }

  private createGroups(): void {
    this.form = this.builder.group({
      id: '',
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)]],
      short_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(16)]],
    });
  }

  public onCancel() {
    this.cancel.emit();
  }

  public onSave() {
    const subscribe = this.isEdit
      ? this.adminService.editJob(this.job)
      : this.adminService.createJob(this.job);
    subscribe.subscribe(job => {
      this.messageService.add({
        key: 'global',
        severity: Boolean(job) && Boolean(job.id) ? 'success' : 'error',
        summary: this.translateService.instant(this.isEdit ? 'JOB.EDIT_RESULT' : 'JOB.CREATE_RESULT'),
        detail: this.translateService.instant(Boolean(job.id) ? 'JOB.SAVE_SUCCESS_TITLE' : 'JOB.SAVE_ERROR_TITLE')
      });
      if (this.isEdit) {
        this.edit.emit(job);
      } else {
        this.create.emit(job);
      }
      this.cancel.emit();
    });
  }

  private loadProperties() {
    if (!Boolean(this.roles) || this.roles.length === 0) {
      this.subscriptions.push(this.adminService.roles.subscribe(roles => {
        this.roles = [...[{ label: this.translateService.instant('JOB.SELECT_ROLE'), value: false }], ...roles];
      }));
    }
  }
}
