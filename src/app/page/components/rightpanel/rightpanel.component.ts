import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ScrollPanel } from 'primeng/primeng';
import { DashboardComponent } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-rightpanel',
  templateUrl: './rightpanel.component.html',
  styleUrls: ['./rightpanel.component.scss']
})
export class RightpanelComponent implements AfterViewInit {

  @ViewChild('scrollRightPanel', { static: false }) rightPanelMenuScrollerViewChild: ScrollPanel;

  constructor(public app: DashboardComponent) { }

  ngAfterViewInit() {
    setTimeout(() => { this.rightPanelMenuScrollerViewChild.moveBar(); }, 100);
  }

}
