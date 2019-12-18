import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  public isLoading = false;
  public headerText = new BehaviorSubject<string>('');

  constructor() { }
}
