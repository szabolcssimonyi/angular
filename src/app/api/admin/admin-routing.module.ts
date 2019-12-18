import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from 'src/app/guards/authentication.guard';
import { AuthorizationGuard } from 'src/app/guards/authorization.guard';


const routes: Routes = [
  { path: '', redirectTo: '/admin/users', pathMatch: 'full' },
  {
    path: 'users', loadChildren: './components/users/users.module#UsersModule',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'UsersModule' }
  },
  {
    path: 'roles', loadChildren: './components/roles/roles.module#RolesModule',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'RolesModule' }
  },
  {
    path: 'jobs', loadChildren: './components/jobs/jobs.module#JobsModule',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'JobsModule' }
  },
  {
    path: 'groups', loadChildren: './components/groups/groups.module#GroupsModule',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'GroupsModule' }
  },
  {
    path: 'learners', loadChildren: './components/learners/learners.module#LearnersModule',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'LearnersModule' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
