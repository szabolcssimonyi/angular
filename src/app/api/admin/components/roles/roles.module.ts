import { NgModule } from '@angular/core';

import { RolesRoutingModule } from './roles-routing.module';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleComponent } from './role/role.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { ConfirmationService, ScrollPanelModule } from 'primeng/primeng';


@NgModule({
  declarations: [RoleListComponent, RoleComponent],
  imports: [
    SharedModule,
    PrimengModule,
    RolesRoutingModule,
    ScrollPanelModule,
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
  ]
})
export class RolesModule { }
