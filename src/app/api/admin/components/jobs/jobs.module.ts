import { NgModule } from '@angular/core';

import { JobsRoutingModule } from './jobs-routing.module';
import { JobListComponent } from './job-list/job-list.component';
import { JobComponent } from './job/job.component';
import { ConfirmationService } from 'primeng/primeng';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [JobListComponent, JobComponent],
  imports: [
    SharedModule,
    PrimengModule,
    JobsRoutingModule,
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
export class JobsModule { }
