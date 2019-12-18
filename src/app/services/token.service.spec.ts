import { TestBed, inject } from '@angular/core/testing';

import { TokenService } from './token.service';
import { Token } from '../interfaces/token';

describe('TokenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TokenService = TestBed.get(TokenService);
    expect(service).toBeTruthy();
  });

  it('should set/get token', inject([TokenService], (service: TokenService) => {
    service.set({
      access_token: 'test access token',
      refresh_token: 'test refresh token',
      access_token_expires: 500
    } as Token);
    const tokenFromStorage = localStorage.getItem(service.tokenName);
    expect(Boolean(tokenFromStorage)).toBe(true);
    expect((JSON.parse(tokenFromStorage)).access_token).toEqual('test access token');
    expect((JSON.parse(tokenFromStorage)).refresh_token).toEqual('test refresh token');
    expect((JSON.parse(tokenFromStorage)).access_token_expires).toMatch(/\d{1,}/);
    const tokenFromService = service.get();
    expect(tokenFromService).not.toBe(false);
    expect(tokenFromService).toEqual(JSON.parse(tokenFromStorage) as Token);
  }));

  it('should validate token', inject([TokenService], (service: TokenService) => {
    const invalidToken = {
      access_token: 'test access token',
      refresh_token: 'test refresh token',
      access_token_expires: -50
    } as Token;
    const validToken = {
      access_token: 'test access token',
      refresh_token: 'test refresh token',
      access_token_expires: 50
    } as Token;
    service.set(invalidToken);
    expect(service.isValid()).toBe(false);
    service.set(validToken);
    expect(service.isValid()).toBe(true);
  }));
});
