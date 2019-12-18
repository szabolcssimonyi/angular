import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/services/user.service';
import { NgForm, FormControl } from '@angular/forms';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent implements OnInit, AfterViewInit {

  public token: string;
  public password = '';
  public passwordAgain = '';

  @ViewChild('form', { static: false }) form: NgForm;

  public get passwordsAreEquel(): boolean {
    if (!Boolean(this.form) || !Boolean(this.form.controls) || !Boolean(this.form.controls['passwordInput'])) {
      return false;
    }
    const p = this.form.controls['passwordInput'] as FormControl;
    const pAgain = this.form.controls['passwordAgainInput'] as FormControl;
    const isDirty = (p.dirty || p.touched) && (pAgain.dirty || pAgain.touched);
    const valid = p.valid && p.valid;
    if (!isDirty || !valid) {
      return true;
    }
    return p.value === pAgain.value;
  }

  public isFormValid(): boolean {
    if (!Boolean(this.form) || !Boolean(this.form.controls) || !Boolean(this.form.controls['passwordInput'])) {
      return false;
    }
    return this.passwordsAreEquel && this.form.valid;
  }

  constructor(
    private userService: UserService,
    private translateService: TranslateService,
    public router: Router,
    private activeRoute: ActivatedRoute) {
    this.translateService.use(this.userService.user.getValue().lang.code);
    if (this.userService.isLoggedin) {
      this.userService.clear();
    }
  }

  ngAfterViewInit(): void {
    console.log(this.form);
  }

  ngOnInit() {
    this.token = this.activeRoute.snapshot.params['token'];
    console.log(this.form);
  }
  public onSubmit() {
    const password = this.form.controls['passwordInput'].value;
    const path = this.activeRoute.snapshot.data.route;
    this.userService.setPassword(this.token, password, path).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
