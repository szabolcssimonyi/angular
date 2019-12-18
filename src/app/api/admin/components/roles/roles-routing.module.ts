import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleListComponent } from './role-list/role-list.component';
import { AuthenticationGuard } from 'src/app/guards/authentication.guard';
import { AuthorizationGuard } from 'src/app/guards/authorization.guard';
import { RoleComponent } from './role/role.component';


const routes: Routes = [
  {
    path: '', component: RoleListComponent, pathMatch: 'full',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'RolesModule', action: ['view', 'delete'] }
  },
  {
    path: ':id', component: RoleComponent,
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: { module: 'RolesModule', action: ['view', 'create', 'edit'] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
