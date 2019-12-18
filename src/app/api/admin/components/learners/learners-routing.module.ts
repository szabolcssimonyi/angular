import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from 'src/app/guards/authentication.guard';
import { AuthorizationGuard } from 'src/app/guards/authorization.guard';
import { GroupsListComponent } from '../groups/group-list/group-list.component';
import { GroupsComponent } from '../groups/group/group.component';
import { GroupType } from 'src/app/interfaces/types';


const routes: Routes = [
  {
    path: '', component: GroupsListComponent, pathMatch: 'full',
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: {
      module: 'GroupsModule',
      action: ['view', 'delete'],
      type: GroupType.LearningGroup
    }
  },
  {
    path: ':id', component: GroupsComponent,
    canLoad: [AuthenticationGuard, AuthorizationGuard],
    canActivate: [AuthenticationGuard, AuthorizationGuard],
    data: {
      module: 'GroupsModule',
      action: ['view', 'create', 'edit'],
      type: GroupType.LearningGroup
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnersRoutingModule { }
