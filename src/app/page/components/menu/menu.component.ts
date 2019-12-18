import { Component, OnInit, Input } from '@angular/core';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { ComponentBase } from '../component-base';
import { Router } from '@angular/router';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent extends ComponentBase implements OnInit {

  @Input() reset: boolean;

  model: any[];

  constructor(
    public app: DashboardComponent,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router) {
    super(userService, pageService, translateService, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscriptions.push(this.userService.user.subscribe(u => {
      this.setMenu();
    }));
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => {
      this.setMenu();
    }));
  }

  public setMenu() {
    this.model = [
      {
        label: this.translateService.instant('SIDEBAR.DASHBOARD'),
        icon: 'dashboard',
        routerLink: ['/'],
        visible: true
      },
      {
        label: this.translateService.instant('SIDEBAR.LESSION_CONTENTS'),
        icon: 'dashboard',
        routerLink: ['lessions'],
        visible: this.userService.hasPermission('LessionsModule')
      },
      {
        label: this.translateService.instant('SIDEBAR.COURSES'),
        icon: 'dashboard',
        routerLink: ['courses'],
        visible: this.userService.hasPermission('CoursesModule')
      },
      {
        label: this.translateService.instant('SIDEBAR.USERMANAGER'),
        icon: 'dashboard',
        visible: this.userService.hasPermission('AdminModule'),
        items: [
          {
            label: this.translateService.instant('SIDEBAR.USERS'),
            icon: 'dashboard',
            routerLink: ['/admin', 'users'],
            visible: this.userService.hasPermission('UsersModule'),
          },
          {
            label: this.translateService.instant('SIDEBAR.ROLES'),
            icon: 'dashboard',
            routerLink: ['/admin', 'roles'],
            visible: this.userService.hasPermission('RolesModule'),
          },
          {
            label: this.translateService.instant('SIDEBAR.JOBS'),
            icon: 'dashboard',
            routerLink: ['/admin', 'jobs'],
            visible: this.userService.hasPermission('JobsModule'),
          },
          {
            label: this.translateService.instant('SIDEBAR.GROUPS'),
            icon: 'dashboard',
            routerLink: ['/admin', 'groups'],
            visible: this.userService.hasPermission('GroupsModule'),
          },
          {
            label: this.translateService.instant('SIDEBAR.LEARNERS'),
            icon: 'dashboard',
            routerLink: ['/admin', 'learners'],
            visible: this.userService.hasPermission('GroupsModule'),
          },
        ]
      },
      {
        label: this.translateService.instant('SIDEBAR.ONBOARDING'),
        icon: 'dashboard',
        routerLink: ['onboarding'],
        visible: this.userService.hasPermission('OnboardingModule')
      },
      {
        label: this.translateService.instant('SIDEBAR.COMPLIANCES'),
        icon: 'dashboard',
        routerLink: ['compliances'],
        visible: this.userService.hasPermission('CompliancesModule')
      },
      {
        label: this.translateService.instant('SIDEBAR.CATEGORIES'),
        icon: 'dashboard',
        routerLink: ['categories'],
        visible: this.userService.hasPermission('CategoriesModule')
      },
      {
        label: this.translateService.instant('SIDEBAR.INVOICING'),
        icon: 'dashboard',
        routerLink: ['invoicing'],
        visible: this.userService.hasPermission('InvoicingModule')
      },
    ];
  }

  changeTheme(theme) {
    const themeLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
    const layoutLink: HTMLLinkElement = document.getElementById('layout-css') as HTMLLinkElement;

    themeLink.href = 'assets/theme/theme-' + theme + '.css';
    layoutLink.href = 'assets/layout/css/layout-' + theme + '.css';
  }
}
