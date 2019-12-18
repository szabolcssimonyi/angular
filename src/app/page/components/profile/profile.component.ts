import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ComponentBase } from '../component-base';
import { setupTestingRouter } from '@angular/router/testing';
import { PageService } from 'src/app/services/page.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('menu', [
      state('hidden', style({
        height: '0px'
      })),
      state('visible', style({
        height: '*'
      })),
      transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class ProfileComponent extends ComponentBase implements OnInit {
  public active = true;
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

  ngOnInit(): void {
    super.ngOnInit();
    this.subscriptions.push(this.userService.user.subscribe(u => {
      this.setUserOnPage();
    }));
    this.subscriptions.push(this.translateService.onLangChange.subscribe(() => {
      this.setUserOnPage();
    }));
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

  public logout(event) {
    super.logout(event);
    this.avatar = environment.paths.avatar;
  }


  onClick(event) {
    this.active = !this.active;
    setTimeout(() => {
      this.app.layoutMenuScrollerViewChild.moveBar();
    }, 450);
    event.preventDefault();
  }


}
