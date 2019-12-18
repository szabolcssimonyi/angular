import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingComponent } from './landing/landing.component';
import { RouterModule } from '@angular/router';
import { SidebarModule, MenubarModule, ConfirmationService } from 'primeng/primeng';
import { PrimengModule } from '../shared/primeng.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../http-loader-factory';
import { HttpClient } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { TopbarComponent } from './components/topbar/topbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MenuComponent } from './components/menu/menu.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { FooterComponent } from './components/footer/footer.component';
import { RightpanelComponent } from './components/rightpanel/rightpanel.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { RequestPasswordResetComponent } from './components/request-password-reset/request-password-reset.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { testModule } from '../shared/test.module';


@NgModule({
  declarations: [
    LoginComponent,
    NotFoundComponent,
    DashboardComponent,
    LandingComponent,
    TopbarComponent,
    ProfileComponent,
    MenuComponent,
    SubMenuComponent,
    BreadcrumbComponent,
    FooterComponent,
    RightpanelComponent,
    SetPasswordComponent,
    RequestPasswordResetComponent,
    ProfileEditComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    MenubarModule,
    PrimengModule,
    SharedModule,
    ImageCropperModule,
    testModule,
    TranslateModule.forRoot({
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
export class PageModule { }
