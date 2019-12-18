import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { MenuItem } from 'primeng/primeng';
import { ComponentBase } from '../component-base';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent extends ComponentBase implements OnInit {
  public menu: MenuItem[] = [];
  public loginTitle = '';
  public avatar = '';
  public userName = 'N/A';
  public role = 'Guest';
  constructor(
    public app: DashboardComponent,
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router) {
    super(userService, pageService, translateService, router);
    this.avatar = environment.paths.avatar;
  }

  ngOnInit() {
    super.ngOnInit();
    this.isLoggedIn = this.userService.isLoggedin;
    this.subscriptions.push(this.userService.user.subscribe(u => {
      this.loginTitle = this.translateService.instant(this.isLoggedIn ? 'PROFILE.LOGOUTBTN' : 'PROFILE.LOGINBTN');
      this.setUserOnPage();
      this.setMenu();
    }));
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => {
      this.loginTitle = this.translateService.instant(this.isLoggedIn ? 'PROFILE.LOGOUTBTN' : 'PROFILE.LOGINBTN');
      this.setUserOnPage();
      this.setMenu();
    }));
  }

  public setMenu() {
    if (!this.userService.isLoggedin) {
      this.menu = [];
      return;
    }
    this.setTopbar();
  }

  public logout(event) {
    super.logout(event);
    this.avatar = environment.paths.avatar;
  }

  private setUserOnPage() {
    this.isLoggedIn = this.userService.isLoggedin;
    this.loginTitle = this.translateService.instant(this.isLoggedIn ? 'PROFILE.LOGOUTBTN' : 'PROFILE.LOGINBTN');
    if (this.isLoggedIn) {
      this.userName = this.me.username;
      this.role = this.me.role;
      this.avatar = Boolean(this.me.avatar) && this.me.avatar !== environment.paths.avatar
        ? `${environment.apiHost}${environment.apiPort}/${environment.urls.avatart}/${this.me.avatar}`
        : environment.paths.avatar;
    } else {
      this.userName = 'N/A';
      this.role = this.translateService.instant('GLOBAL.GUEST');
    }
  }

  private setTopbar() {
    this.menu = [
      {
        label: this.translateService.instant('TOPBAR.SHOP'),
        icon: 'dashboard',
        routerLink: ['/shop'],
      },
      {
        label: this.translateService.instant('TOPBAR.MYCOURSES'),
        icon: 'dashboard',
        routerLink: ['/my-courses']
      },
      {
        label: this.translateService.instant('TOPBAR.CHAT'),
        icon: 'dashboard',
        routerLink: ['/chat']
      },
      {
        label: this.translateService.instant('TOPBAR.CHALLENGE'),
        icon: 'dashboard',
        routerLink: ['/challenges']
      },
      {
        label: this.translateService.instant('TOPBAR.MYPOINTS'),
        icon: 'dashboard',
        routerLink: ['/my-points']
      },
    ];
  }

}
