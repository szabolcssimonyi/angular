import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { DialogComponent } from '../page/components/dialog/dialog.component';
import { HeaderComponent } from '../page/components/header/header.component';
import { PrimengModule } from './primeng.module';
import { ShortenTextPipe } from '../pipes/shorten-text.pipe';



@NgModule({
  declarations: [ShortenTextPipe, DialogComponent, HeaderComponent],
  imports: [
    CommonModule,
    PrimengModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    DialogComponent,
    HeaderComponent,
    ShortenTextPipe
  ]
})
export class testModule { }
