import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ComponentBase } from 'src/app/page/components/component-base';
import { MessageService, FileUpload, ConfirmationService } from 'primeng/primeng';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Job } from 'src/app/interfaces/Job';
import { Group } from 'src/app/interfaces/group';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { isNumber } from 'util';
import { PageService } from 'src/app/services/page.service';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent extends ComponentBase implements OnInit, AfterViewInit {

  @ViewChild('avatarUploader', { static: false }) avatarUploader: FileUpload;

  @Output() cancel = new EventEmitter();
  @Output() create = new EventEmitter<User>();
  @Output() edit = new EventEmitter<User>();

  public set user(user: User) {
    this.avatarUrl = null;
    this.avatarObject = null;
    this.imageChangedEvent = null;
    this.form.reset();
    !Boolean(user) || !Boolean(user.id)
      ? this.setFormForCreate()
      : this.setformForEdit(user);
  }


  public get user(): User {
    return this.form.value as User;
  }

  public get isUserFormValid(): boolean {
    return ![
      this.form.valid
    ].some(validator => validator === false);
  }

  public form: FormGroup;
  public avatarData: any = null;
  public avatarUrl: string = null;
  public avatarObject: any = null;
  public title: string;
  public isEdit = false;
  public groups: { label: string, value: string | number | boolean }[] = [];
  public jobs: { label: string, value: string | number | boolean }[] = [];
  public roles: { label: string, value: string | number | boolean }[] = [];
  public states: { label: string, value: string | number | boolean }[] = [];
  public genders: { label: string, value: string | number | boolean }[] = [];
  public imageChangedEvent: any = '';

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    protected messageService: MessageService,
    private confirmationService: ConfirmationService,
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
    this.avatarObject = environment.paths.avatar;
  }

  ngAfterViewInit(): void {
    this.avatarUploader.onFileSelect = ($event) => {
      this.imageChangedEvent = $event;
    };
  }

  private setFormForCreate() {
    this.title = this.translateService.instant('USER.ADD_TITLE');
    this.isEdit = false;
    this.avatarObject = environment.paths.avatar;
    this.form.patchValue({} as User);
  }

  private setformForEdit(user: User) {
    this.isEdit = true;
    this.title = this.translateService.instant('USER.EDIT_TITLE');
    this.adminService.loadUser(user.id).subscribe(u => {
      const clone = { ...u };
      clone.work_started_date = this.getDateFromTimeStamp(Number(clone.work_started_date));
      this.avatarObject = Boolean(clone.avatar)
        ? `${environment.apiHost}${environment.apiPort}/${environment.urls.avatart}/${clone.avatar}`
        : environment.paths.avatar;
      if (Boolean(clone.avatar)) {
        this.avatarUrl = clone.avatar;
      }
      clone.job = Boolean(clone.job) ? (clone.job as Job).id : 0;
      clone.group = Boolean(clone.group) ? (clone.group as Group).id : 0;
      this.form.patchValue(clone);
    });
  }

  private createGroups(): void {
    this.form = this.builder.group({
      id: '',
      lang_id: 1,
      is_deleted: 0,
      is_hidden: 0,
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(24)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(24)]],
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(24)]],
      gender_id: ['', [this.isSelectedValidator]],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', [Validators.minLength(6)]],
      // avatar: [''],
      group: ['', [this.isSelectedValidator]],
      job: ['', [this.isSelectedValidator]],
      role: ['', [this.isSelectedValidator]],
      active: ['', [this.isSelectedValidator]],
      external_id: ['', [Validators.maxLength(32)]],
      work_started_date: ['', Validators.required],
    });
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.avatarData = event.file;
  }

  public addAvatar($event) {
    const file = ($event.files as FileList).item(0);
    this.avatarData = file;
    this.avatarUrl = null;
    this.avatarUploader.clear();
  }

  public onCancel() {
    this.cancel.emit();
  }

  public onSave() {
    const user = { ...this.form.value } as User;
    user.work_started_date = (new Date(user.work_started_date).getTime() / 1000).toString();
    user.is_deleted = 0;
    user.is_hidden = 0;
    user.lang_id = 1;
    if (Boolean(this.avatarUrl)) {
      user.avatar = this.avatarUrl;
    } else {
      delete user.avatar;
    }
    if (Boolean(this.avatarData)) {
      user.avatar_img = new File([this.avatarData], 'temp.jpg');
    } else {
      delete user.avatar_img;
    }
    const subscribe = this.isEdit
      ? this.adminService.editUser(user)
      : this.adminService.createUser(user);
    const handler = this.isEdit ? this.edit : this.create;
    subscribe.subscribe(result => {
      this.messageService.add({
        key: 'global',
        severity: Boolean(result) && Boolean(result.id) ? 'success' : 'error',
        summary: this.translateService.instant(this.isEdit ? 'USER.EDIT_RESULT' : 'USER.CREATE_RESULT'),
        detail: this.translateService.instant(Boolean(result) && Boolean(result.id)
          ? 'USER.SAVE_SUCCESS_TITLE'
          : 'USER.SAVE_ERROR_TITLE')
      });
      const u = { ...this.form.value as User };
      u.avatar = environment.paths.avatar;
      if (Boolean(result.id)) {
        u.id = result.id;
      }
      this.imageChangedEvent = null;
      handler.emit(u);
      this.cancel.emit();
    });
  }

  private isSelectedValidator(control: FormControl): { [key: string]: any } {
    return control.value === false ? { notselected: true } : null;
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
    if (!Boolean(this.genders) || this.genders.length === 0) {
      this.subscriptions.push(this.adminService.genders.subscribe(genders => {
        this.genders = [...[{ label: this.translateService.instant('USER.SELECT_GENDER'), value: false }], ...genders];
      }));
    }
    if (!Boolean(this.states) || this.states.length === 0) {
      this.states = [
        { label: this.translateService.instant('USER.SELECT_STATE'), value: false },
        { label: this.translateService.instant('USER.STATE_ACTIVE'), value: 1 },
        { label: this.translateService.instant('USER.STATE_INACTIVE'), value: 0 }
      ];
    }
  }

  public onResetPassword() {
    this.confirmationService.confirm({
      message: `${this.translateService.instant('USER.ARE_YOU_SURE_TO_RESET_EMAIL')}`,
      accept: () => {
        const user = this.form.value as User;
        this.userService.requestPasswordReset(user.email).subscribe(() => {
          this.messageService.add({
            key: 'global',
            severity: 'success',
            summary: this.translateService.instant('USER.PASSWORD_RESET_EMAIL_SENT'),
            detail: this.translateService.instant('USER.USER_WILL_GET_EMAIL')
          });
          this.cancel.emit();
        });
      }
    });
  }

  private getDateFromTimeStamp(timeStamp: number): string {
    const date = new Date(timeStamp * 1000);
    return `${date
      .getFullYear()}-${(date
        .getMonth() + 1)}-${date
          .getDate()}`;
  }

}
