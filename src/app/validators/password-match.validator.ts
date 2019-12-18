import { ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class PasswordMatchValidator {

    public get(passCtrlName: string, passAgainCtrlName: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const passCtrl = control.get(passCtrlName) as FormControl;
            const passAgainCtrl = control.get(passAgainCtrlName) as FormControl;

            const newPass: string = passCtrl.value;
            const newPassAgain: string = passAgainCtrl.value;
            return newPass === newPassAgain ? null : { notequels: true };
        };
    }
}