import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { TokenService } from 'src/app/services/token.service';
import { Token } from '@angular/compiler';
import { MessageService } from 'primeng/primeng';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild('form', { static: false }) form: NgForm;

  public email = '';
  public password = '';
  public dialogVisible = false;

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private changeDetector: ChangeDetectorRef,
    public router: Router) {
    this.translateService.use(this.userService.user.getValue().lang.code);
  }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      const body = document.getElementsByTagName('form')[0] as HTMLElement;
      window.focus();
      body.click();
      body.focus();
    }, 5000);
  }

  public onSubmit() {
    this.userService.login(this.email, this.password).subscribe(t => {
      if (Boolean(t)) {
        this.userService.load();
        this.router.navigate(['/']);
      } else {
        this.userService.clear();
        this.messageService.add({
          key: 'global',
          summary: this.translateService.instant('LOGIN.FAILED_TITLE'),
          detail: this.translateService.instant('LOGIN.FAILED_DETAILS')
        });
      }
    });
  }

  public closeDialog() {
    this.dialogVisible = false;
  }

  public showDialog() {
    this.dialogVisible = true;
  }
}
