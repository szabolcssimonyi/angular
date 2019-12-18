import { Injectable } from '@angular/core';
import { Token } from '../interfaces/token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  public get tokenName() {
    return 'test-token';
  }

  constructor() { }

  public get(): false | Token {
    if (!this.has()) {
      return false;
    }
    const token = JSON.parse(localStorage.getItem(this.tokenName)) as Token;
    return token;
  }

  public set(token: Token): void {
    const copy = Object.assign({}, token);
    copy.access_token_expires = this.getNextTimeout(token.access_token_expires);
    localStorage.setItem(this.tokenName, JSON.stringify(copy));
  }

  public has(): boolean {
    const str = localStorage.getItem(this.tokenName);
    if (!Boolean(str)) {
      return false;
    }
    const token = JSON.parse(str) as Token;
    return Boolean(token) && Boolean(token.access_token);
  }

  public isValid(): boolean {
    const token = this.get();
    return Boolean(token) && (token as Token).access_token_expires > new Date().getTime();
  }

  public clear(): void {
    localStorage.removeItem(this.tokenName);
  }

  private getNextTimeout(timeout: number): number {
    const now = new Date();
    return new Date(timeout * 1000).getTime();
  }

  public isToken(arg: any): arg is Token {
    return Boolean(arg)
      && typeof (arg['access_token']) !== 'undefined';
  }

}
