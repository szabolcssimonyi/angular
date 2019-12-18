import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsRoutingModule } from './groups-routing.module';
import { ConfirmationService } from 'primeng/primeng';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { GroupsComponent } from './group/group.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GroupsListComponent } from './group-list/group-list.component';


@NgModule({
  declarations: [GroupsComponent, GroupsListComponent],
  imports: [
    CommonModule,
    SharedModule,
    PrimengModule,
    GroupsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ConfirmationService
  ],
  exports: [
    GroupsComponent, GroupsListComponent
  ]
})
export class GroupsModule { }
