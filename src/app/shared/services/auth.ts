import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { UserService } from './user';
import { subscribeOnce } from '../helpers/subscribeOnce';
import Pusher from 'pusher-js'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  pusher: any;

  private router = inject(Router);
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  private userService = inject(UserService);

  public status$ = new BehaviorSubject<boolean>(false);

  // SIGN UP METHOD
  signUp(username: string, email: string, password: string) {
    const payload = JSON.stringify({ username, email, password });
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post(`${this.url}/users`, payload, {headers})
    // .pipe(
    //   map(() => true)
    // );
  }

  // SIGN IN/OUT METHODS
  signIn(email: string, password: string): Observable<any> {
    const payload = JSON.stringify({ email, password });
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post(`${this.url}/login`, payload, {headers}).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        subscribeOnce(this.validateToken());
      })
    );
  }

  signOut(): void {
    this.destroyToken();
    this.userService.user$.next(null);
    this.status$.next(false);
  }

  // TOKEN METHODS
  get token(): string | null {
    return localStorage.getItem('token');
  }

  destroyToken(): void {
    localStorage.removeItem('token');
  }

  validateToken(): Observable<boolean> {
    return this.http.get(`${this.url}/validate_token`).pipe(
      tap((response: any) => {
        this.status$.next(response.valid);
        subscribeOnce(this.userService.getCurrentUser());
      }),
      catchError(error => {
        console.error(error);
        return of(false);
      })
    );
  }
}
