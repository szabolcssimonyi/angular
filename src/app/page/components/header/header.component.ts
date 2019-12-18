import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComponentBase } from '../component-base';
import { PageService } from 'src/app/services/page.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends ComponentBase implements OnInit {

  @Input() isCloseVisible = true;
  @Input() isSearchVisible = true;
  @Input() title = '';
  @Output() close = new EventEmitter();

  constructor(
    protected userService: UserService,
    protected pageService: PageService,
    protected translateService: TranslateService,
    protected router: Router) {
    super(userService, pageService, translateService, router);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
