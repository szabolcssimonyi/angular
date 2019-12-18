import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ComponentBase } from 'src/app/page/components/component-base';
import { PageList } from 'src/app/interfaces/page-list';
import { AdminService, AdminListProperties } from '../../../services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/primeng';
import { JobComponent } from '../job/job.component';
import { Job } from 'src/app/interfaces/Job';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent extends ComponentBase implements OnInit {

  public list: PageList<Job> = {
    items: [] as Job[],
    _meta: {
      currentPage: 1,
      pageCount: 1,
      perPage: 20,
      totalCount: 20
    }
  } as PageList<Job>;
  public columns = [];
  public selected: Job = null;
  public dialogVisible = false;
  @ViewChild('dialog', { static: false }) dialog: JobComponent;

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
    this.pageService.headerText.next('JOB.LIST.TITLE');
    super.ngOnInit();
    this.setColumns();
    this.load();
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => this.setColumns()));
  }

  private setColumns() {
    this.columns = [
      { field: 'name', header: this.translateService.instant('JOB.LIST.NAME') },
      { field: 'short_name', header: this.translateService.instant('JOB.LIST.SHORT_NAME') },
    ];
  }

  public load() {
    this.subscriptions.push(this.adminService.loadJobs()
      .subscribe(list => {
        this.setColumns();
        this.list = list;
      }));
  }

  public delete() {
    if (!Boolean(this.selected)) {
      return;
    }

    this.confirmationService.confirm({
      message: `${this.translateService.instant('JOB.LIST.ARE_YOU_SURE_TO_DELETE')}: ${this.selected.name}`,
      accept: () => {
        this.adminService.deleteProperty(AdminListProperties.jobs, this.selected.id)
          .toPromise()
          .then(() => {
            this.list.items = this.list.items
              .filter(i => i.id !== this.selected.id);
            this.adminService.invalidate(AdminListProperties.jobs);
            this.selected = null;
            this.messageService.add({
              key: 'global',
              severity: 'success',
              summary: this.translateService.instant('JOB.LIST.DELETE_SUCCESS_TITLE'),
              detail: `${this.translateService.instant('JOB.LIST.DELETE_SUCCESS_DETAIL')}`
            });
          });
      }
    });
  }

  public showAddDialog() {
    this.dialog.job = {} as Job;
    this.dialogVisible = true;
  }

  public showEditDialog() {
    this.dialog.job = this.selected;
    this.dialogVisible = true;
  }

  public closeDialog() {
    this.dialogVisible = false;
  }

  public edit(job: Job) {
    for (let i = 0; i < this.list.items.length; i++) {
      if (this.list.items[i].id === job.id) {
        this.list.items[i] = job;
        this.adminService.invalidate(AdminListProperties.jobs);
      }
    }
  }

  public add(job: Job) {
    this.list.items = [...[job], ...this.list.items];
    this.adminService.invalidate(AdminListProperties.jobs);
  }

  public changeSelection($event) {
    console.log(this.selected);
  }
}
