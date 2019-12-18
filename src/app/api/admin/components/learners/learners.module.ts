import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearnersRoutingModule } from './learners-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { ConfirmationService } from 'primeng/primeng';
import { GroupsModule } from '../groups/groups.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    PrimengModule,
    LearnersRoutingModule,
    GroupsModule,
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
export class LearnersModule { }
