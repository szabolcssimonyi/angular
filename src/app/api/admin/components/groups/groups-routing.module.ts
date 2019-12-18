import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsComponent } from './group/group.component';
import { AuthenticationGuard } from 'src/app/guards/authentication.guard';
import { AuthorizationGuard } from 'src/app/guards/authorization.guard';
import { GroupsListComponent } from './group-list/group-list.component';
import { GroupType } from 'src/app/interfaces/types';


const routes: Routes = [
  {
    path: '', component: GroupsListComponent, pathMatch: 'full',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: {
      module: 'GroupsModule',
      action: ['view', 'delete'],
      type: GroupType.Organization
    }
  },
  {
    path: ':id', component: GroupsComponent,
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: {
      module: 'GroupsModule',
      action: ['view', 'create', 'edit'],
      type: GroupType.Organization
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
