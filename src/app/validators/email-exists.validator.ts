import { AbstractControl, AsyncValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { AdminService } from '../api/admin/services/admin.service';

@Injectable()
export class EmailExistsValidator implements OnDestroy {
    private emailSubscription: Subscription = null;
    constructor(private adminService: AdminService) { }

    public get(origEmail: string, timer: any): AsyncValidatorFn {
        return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
            clearTimeout(timer);
            return new Promise(resolve => {
                timer = setTimeout(() => {
                    if (Validators.email(control) !== null) {
                        resolve(null);
                    }
                    if (control.value === origEmail) {
                        resolve(null);
                    } else {
                        if (this.emailSubscription !== null) {
                            this.emailSubscription.unsubscribe();
                            this.emailSubscription = null;
                        }
                        this.adminService.isEmailExists(control.value).subscribe(res => {
                            resolve(res ? { emailtaken: true } as ValidationErrors : null);
                        });
                    }
                }, 700);
            });
        };
    }
    ngOnDestroy(): void {
        if (this.emailSubscription) {
            this.emailSubscription.unsubscribe();
        }
    }
}
