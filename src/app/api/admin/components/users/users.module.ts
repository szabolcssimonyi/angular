import { NgModule } from '@angular/core';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserComponent } from './user/user.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { ConfirmationService } from 'primeng/primeng';
import { PasswordMatchValidator } from 'src/app/validators/password-match.validator';
import { EmailExistsValidator } from 'src/app/validators/email-exists.validator';
import { UserSearchComponent } from './user-search/user-search.component';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [UserListComponent, UserComponent, UserSearchComponent],
  imports: [
    SharedModule,
    PrimengModule,
    ImageCropperModule,
    UsersRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    PasswordMatchValidator,
    EmailExistsValidator,
    ConfirmationService,
  ]
})
export class UsersModule { }
