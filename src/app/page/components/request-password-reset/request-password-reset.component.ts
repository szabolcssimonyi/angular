import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MessageService } from 'primeng/primeng';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss']
})
export class RequestPasswordResetComponent implements OnInit {

  public email = '';

  @Output() cancel = new EventEmitter();

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private translateService: TranslateService) { }

  ngOnInit() {
  }
  public onSubmit() {
    this.userService.requestPasswordReset(this.email).subscribe(() => {
      this.messageService.add({
        key: 'global',
        severity: 'success',
        summary: this.translateService.instant('LOGIN.PASSWORD_RESET_SENT'),
        detail: this.translateService.instant('LOGIN.CHECK_EMAIL')
      });
      this.cancel.emit();
    });
  }
}
