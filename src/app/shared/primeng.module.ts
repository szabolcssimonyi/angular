import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GrowlModule, ButtonModule, MenuModule, CardModule,
  InputTextModule, PasswordModule, CheckboxModule, PanelModule, DropdownModule, TreeTableModule, ScrollPanelModule,
  DialogModule, MultiSelectModule, SpinnerModule, CalendarModule,
  ConfirmDialogModule, TreeModule, SelectButtonModule, FileUploadModule, ProgressSpinnerModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GrowlModule,
    ButtonModule,
    MenuModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    CheckboxModule,
    PanelModule,
    DropdownModule,
    TreeTableModule,
    TreeModule,
    ScrollPanelModule,
    TableModule,
    DialogModule,
    MultiSelectModule,
    SpinnerModule,
    CalendarModule,
    ConfirmDialogModule,
    SelectButtonModule,
    FileUploadModule,
    ProgressSpinnerModule
  ],
  exports: [
    GrowlModule,
    ButtonModule,
    MenuModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    CheckboxModule,
    PanelModule,
    DropdownModule,
    TreeTableModule,
    TreeModule,
    ScrollPanelModule,
    TableModule,
    DialogModule,
    MultiSelectModule,
    SpinnerModule,
    CalendarModule,
    ConfirmDialogModule,
    SelectButtonModule,
    FileUploadModule,
    ProgressSpinnerModule
  ]

})
export class PrimengModule { }
