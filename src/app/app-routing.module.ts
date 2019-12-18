import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { NotFoundComponent } from './page/not-found/not-found.component';
import { LandingComponent } from './page/landing/landing.component';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthorizationGuard } from './guards/authorization.guard';
import { SetPasswordComponent } from './page/set-password/set-password.component';
import { ProfileEditComponent } from './page/profile-edit/profile-edit.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: DashboardComponent, children: [
      { path: '', component: LandingComponent, pathMatch: 'full' },
      {
        path: 'set-password/:token',
        component: SetPasswordComponent,
        pathMatch: 'full',
        data: { route: 'set_password' }
      },
      {
        path: 'reset-password/:token',
        component: SetPasswordComponent,
        pathMatch: 'full',
        data: { route: 'reset_password' }
      },
      {
        path: 'admin', loadChildren: './api/admin/admin.module#AdminModule',
        canLoad: [AuthenticationGuard, AuthorizationGuard],
        canActivate: [AuthenticationGuard, AuthorizationGuard],
        data: { module: 'AdminModule' }
      },
      {
        path: 'profile', component: ProfileEditComponent,
        canLoad: [AuthenticationGuard],
        canActivate: [AuthenticationGuard],
      },
    ]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
