import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  @Input() isDialogVisible = false;
  @Input() isSearchVisible = false;
  @Input() isCloseVisible = true;
  @Input() isModal = true;
  @Input() title = '';
  @Output() close = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public closeDialog(event) {
    this.close.emit(event);
  }

}
