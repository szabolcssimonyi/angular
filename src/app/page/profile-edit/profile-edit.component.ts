import { Component, OnInit, Output, ChangeDetectorRef, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { ComponentBase } from '../components/component-base';
import { User } from 'src/app/interfaces/user';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AdminService } from 'src/app/api/admin/services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MessageService, FileUpload, ConfirmationService } from 'primeng/primeng';
import { environment } from 'src/environments/environment';
import { Job } from 'src/app/interfaces/Job';
import { Group } from 'src/app/interfaces/group';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent extends ComponentBase implements OnInit, AfterViewInit {

  @ViewChild('avatarUploader', { static: false }) avatarUploader: FileUpload;

  public form: FormGroup;
  public avatarData: any = null;
  public avatarUrl: string = null;
  public avatarObject: any = null;
  public genders: { label: string, value: string | number | boolean }[] = [];
  public jobs: { label: string, value: string | number | boolean }[] = [];
  public groups: { label: string, value: string | number | boolean }[] = [];
  public roles: { label: string, value: string | number | boolean }[] = [];
  public states: { label: string, value: string | number | boolean }[] = [];
  private email = '';
  public imageChangedEvent: any = '';

  public get isUserFormValid(): boolean {
    return ![
      this.form.valid
    ].some(validator => validator === false);
  }

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    protected messageService: MessageService,
    public confirmationService: ConfirmationService,
    private builder: FormBuilder) {
    super(userService, pageService, translateService, router);
    this.createGroups();
  }

  ngOnInit() {
    super.ngOnInit();
    this.pageService.headerText.next('PROFILE.TITLE');
    this.avatarObject = environment.paths.avatar;
    this.loadProperties();
    this.pageService.isLoading = true;
    this.subscriptions.push(this.userService.user.subscribe(user => {
      this.pageService.isLoading = false;
      if (!Boolean(user) || !Boolean(user.id)) {
        return;
      }
      this.adminService.loadUser(user.id).subscribe(u => {
        this.setformForEdit(u);
      });
    }));
  }

  ngAfterViewInit(): void {
    this.avatarUploader.onFileSelect = ($event) => {
      this.imageChangedEvent = $event;
    };
  }

  private setformForEdit(user: User) {
    const clone = { ...user };
    clone.work_started_date = this.getDateFromTimeStamp(Number(clone.work_started_date));
    this.avatarObject = Boolean(clone.avatar)
      ? `${environment.apiHost}${environment.apiPort}/${environment.urls.avatart}/${clone.avatar}`
      : environment.paths.avatar;
    if (Boolean(clone.avatar)) {
      this.avatarUrl = clone.avatar;
    }
    const job = (Boolean(clone.job) ? clone.job : {}) as Job;
    const group = (Boolean(clone.group) ? clone.group : {}) as Group;
    this.jobs = [{ label: job.name, value: job.id }];
    this.groups = [{ label: group.name, value: group.id }];
    this.roles = [{ label: clone.role, value: clone.role }];
    this.states = [{
      label: this.translateService.instant(clone.active ? 'USER.STATE_ACTIVE' : 'USER.STATE_INACTIVE'),
      value: clone.active
    }];
    this.form.patchValue(clone);
    this.email = user.email;
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
      email: [{ value: '', disabled: true }],
      tel: ['', [Validators.minLength(6)]],
      group: [{ value: '', disabled: true }],
      job: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      active: [{ value: '', disabled: true }],
      external_id: [{ value: '', disabled: true }],
      work_started_date: [{ value: '', disabled: true }],
    });
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.avatarData = event.file;
  }

  public onSave() {
    const user = { ...this.userService.user.getValue(), ...this.form.value };
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
    this.userService.saveProfile(user);
    this.messageService.add({
      key: 'global',
      severity: 'success',
      summary: this.translateService.instant('USER.EDIT_RESULT'),
      detail: this.translateService.instant('USER.SAVE_SUCCESS_TITLE')
    });
  }

  private isSelectedValidator(control: FormControl): { [key: string]: any } {
    return control.value === false ? { notselected: true } : null;
  }

  private loadProperties() {
    if (!Boolean(this.genders) || this.genders.length === 0) {
      this.subscriptions.push(this.adminService.genders.subscribe(genders => {
        this.genders = [...[{ label: this.translateService.instant('USER.SELECT_GENDER'), value: false }], ...genders];
      }));
    }
  }

  private getDateFromTimeStamp(timeStamp: number): string {
    return `${(new Date(timeStamp * 1000))
      .getFullYear()}-${((new Date())
        .getMonth() + 1)}-${(new Date())
          .getDate()}`;
  }
  public onResetPassword() {
    this.confirmationService.confirm({
      message: `${this.translateService.instant('USER.ARE_YOU_SURE_TO_RESET_EMAIL')}`,
      accept: () => {
        this.userService.requestPasswordReset(this.email).subscribe(() => {
          this.messageService.add({
            key: 'global',
            severity: 'success',
            summary: this.translateService.instant('USER.PASSWORD_RESET_EMAIL_SENT'),
            detail: this.translateService.instant('USER.USER_WILL_GET_EMAIL')
          });
        });
      }
    });
  }

  public addAvatar($event) {
    const file = ($event.files as FileList).item(0);
    this.avatarData = file;
    this.avatarUploader.clear();
  }
}
