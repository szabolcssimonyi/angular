import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ComponentBase } from 'src/app/page/components/component-base';
import { UserService } from 'src/app/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';
import { GroupsComponent } from '../group/group.component';
import { Group } from 'src/app/interfaces/group';
import { GroupType } from 'src/app/interfaces/types';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupsListComponent extends ComponentBase implements OnInit {

  @ViewChild('dialog', { static: false }) dialog: GroupsComponent;

  public groups: TreeNode[] = null;
  public columns = [];
  public selectedRole: { label: string, value: string | number | boolean } = null;
  public dialogVisible = false;
  public selectedGroup: TreeNode;
  public roles: { label: string, value: string | number | boolean }[];
  public type = GroupType.Organization;
  public newButtonTitle = 'GROUPS.CREATE_NEW_ORGANIZATION';

  constructor(
    private adminService: AdminService,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router,
    private activeRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    protected messageService: MessageService,
    private changeDetector: ChangeDetectorRef) {
    super(userService, pageService, translateService, router);
    this.type = this.activeRoute.snapshot.data.type;
    this.newButtonTitle = this.type === GroupType.Organization ? 'GROUPS.CREATE_NEW_ORGANIZATION' : 'GROUPS.CREATE_NEW_LEARNERGROUP';
  }

  ngOnInit() {
    this.pageService.headerText.next(this.type === GroupType.Organization ? 'GROUPS.ORGANIZATION_TITLE' : 'GROUPS.LEARNERS_TITLE');
    super.ngOnInit();
    this.load();
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => {
    }));
  }

  public load() {
    this.subscriptions.push(
      (this.type === GroupType.Organization
        ? this.adminService.loadOrganizationGroups()
        : this.adminService.loadStudentGroups())
        .subscribe(groups => {
          this.groups = groups.map(group => this.adminService.convertGroupToTreeNode(group));
          console.log(this.groups);
        }));
    this.subscriptions.push(this.adminService.roles.subscribe(roles => this.roles = roles));
  }

  public rowEdited($event) {
    console.log($event);
  }

  private getNodeCounts(node: TreeNode) {
    let employeeNumber = 0;
    let employeeLimit = 0;
    let jobNumber = 0;
    (node.data.jobs as TreeNode[]).forEach(j => {
      this.getJobCount(j);
      employeeNumber += j.data.employeeNumber;
      employeeLimit += j.data.employeeLimit;
      jobNumber += j.data.jobNumber;
    });
    node.children.forEach(n => {
      this.getNodeCounts(n);
    });
    node.data.employeeNumber += employeeNumber;
    node.data.employeeLimit += employeeLimit;
    node.data.jobNumber += jobNumber;
  }

  private getJobCount(job: TreeNode) {
    if (!Boolean(job.children) || job.children.length === 0) {
      return;
    }
    let employeeNumber = 0;
    let employeeLimit = 0;
    job.children.forEach(n => {
      employeeNumber += n.data.employeeNumber;
      employeeLimit += n.data.employeeLimit;
    });
    job.data.employeeNumber += employeeNumber;
    job.data.employeeLimit += employeeLimit;
    job.data.jobNumber = job.children.length;
  }

  public addJob(node: TreeNode) {
    console.log(node);
    if (!Boolean(node.children)) {
      node.children = [];
    }
    node.children.push({
      data: {
        name: '',
        limit: 1,
        role: '',
        count: 0,
        disabled: false
      }
    } as TreeNode);
    this.changeDetector.detectChanges();
  }

  public addGroups(group: Group) {
    if (!Boolean(group.parent_id)) {
      this.load();
      return;
    }
    this.adminService.loadGroupChildren(group.parent_id).subscribe(groups => {
      this.selectedGroup.children = groups.map(g => this.adminService.convertGroupToTreeNode(g, this.selectedGroup));
      this.groups = [...this.groups];
      this.selectedGroup = null;
    });
  }

  public editGroups(group: Group) {
    if (!Boolean(group.parent_id)) {
      this.load();
      return;
    }
    this.adminService.loadGroupChildren(group.parent_id).subscribe(groups => {
      this.selectedGroup.parent.children = groups.map(g => this.adminService.convertGroupToTreeNode(g, this.selectedGroup));
      this.groups = [...this.groups];
      this.selectedGroup = null;
    });
  }

  public showAddDialog() {
    const parent = this.adminService.convertTreeNodeToGroup(this.selectedGroup);
    this.dialog.group = { parent_id: parent.id, type: 1, level: parent.level++ } as Group;
    this.dialogVisible = true;
  }

  public showCreateRoot() {
    this.dialog.group = {} as Group;
    this.dialogVisible = true;
  }

  public showEditDialog() {
    if (!Boolean(this.selectedGroup)) {
      return;
    }
    this.dialog.group = this.adminService.convertTreeNodeToGroup(this.selectedGroup);
    this.dialogVisible = true;
  }

  public closeDialog() {
    this.dialogVisible = false;
  }
  public onNodeExpand(event) {
    console.log(event);
    this.adminService.loadGroupChildren(event.node.data.id).subscribe(groups => {
      event.node.children = groups.map(g => this.adminService.convertGroupToTreeNode(g, event.node));
      this.groups = [...this.groups];
    });
  }

  public delete() {
    if (!Boolean(this.selectedGroup)) {
      return;
    }
    const title = this.selectedGroup.data.name;
    this.confirmationService.confirm({
      message: `${this.translateService.instant('GROUPS.LIST.ARE_YOU_SURE_TO_DELETE')}: ${this.selectedGroup.data.name}`,
      accept: () => {
        this.adminService.deleteGroup(this.selectedGroup.data.id).subscribe(result => {
          this.deleteSelectedGroup();
          this.messageService.add({
            key: 'global',
            severity: 'success',
            summary: this.translateService.instant('GROUPS.LIST.DELETE_SUCCESS_TITLE'),
            detail: `${title}: ${this.translateService.instant('GROUPS.LIST.DELETE_SUCCESS_DETAIL')}`
          });
        });
      }
    });

  }

  private deleteSelectedGroup() {
    if (Boolean(this.selectedGroup.parent)) {
      this.selectedGroup.parent.children = [...(this.selectedGroup.parent.children as TreeNode[])
        .filter(c => c.data.row_id !== this.selectedGroup.data.row_id)];
      this.groups = [...this.groups];
    } else {
      this.groups = [...this.groups.filter(g => g.data.row_id !== this.selectedGroup.data.row_id)];
    }
    this.selectedGroup = null;
  }
}
