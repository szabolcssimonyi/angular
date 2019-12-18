import { OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/user';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PageService } from 'src/app/services/page.service';

export class ComponentBase implements OnDestroy, OnInit {


  public isLoggedIn = false;
  public me: User = null;
  protected subscriptions: Subscription[] = [];

  constructor(
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router) {
    this.me = this.userService.user.getValue();
  }

  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedin;
    this.subscriptions.push(this.userService.user.subscribe(u => {
      this.me = u;
      this.me.avatar = Boolean(this.me.avatar) ? this.me.avatar : environment.paths.avatar;
      this.translateService.use(this.userService.user.getValue().lang.code);
      this.isLoggedIn = this.userService.isLoggedin;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
  public login(event) {
    event.preventDefault();
    this.userService.clear();
    this.router.navigate([environment.routes.login]);
  }
  public logout(event) {
    event.preventDefault();
    this.router.navigate(['/']);
    this.userService.clear();
  }

  public showAdvancedSearch() {
    this.userService.triggerAdvancedSearch.next(true);
  }

  public closeAdvancedSearch() {
    this.userService.triggerAdvancedSearch.next(false);
  }
}
