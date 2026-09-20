import {
  ChangeDetectionStrategy,
  Component,
  Type,
  ViewContainerRef,
  signal,
  viewChild,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { MetricWidget } from './widgets/metric-widget';
import { PortalHint } from './widgets/portal-hint';
import { StatusWidget } from './widgets/status-widget';

interface WidgetOption {
  readonly label: string;
  readonly component: Type<unknown>;
  readonly message: string;
}

@Component({
  selector: 'app-sample-15-dynamic-view',
  imports: [NgComponentOutlet, P00NgrxNavi, PortalModule],
  templateUrl: './sample-15-dynamic-view.html',
  styleUrl: './sample-15-dynamic-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample15DynamicView {
  readonly widgetOptions: readonly WidgetOption[] = [
    { label: '状態', component: StatusWidget, message: 'NgComponentOutlet が状態を表示' },
    { label: '指標', component: MetricWidget, message: 'NgComponentOutlet が成功率 98% を表示' },
  ];
  readonly selectedWidget = signal(this.widgetOptions[0]);
  readonly portal = new ComponentPortal(PortalHint);

  private readonly manualHost = viewChild.required('manualHost', { read: ViewContainerRef });

  selectWidget(select: HTMLSelectElement): void {
    this.selectedWidget.set(this.widgetOptions[Number(select.value)] ?? this.widgetOptions[0]);
  }

  createManually(option: WidgetOption): void {
    // [■観点:createComponent] 挿入先を明示して ComponentRef を命令的に作る。
    const host = this.manualHost();
    host.clear();
    const componentRef = host.createComponent(option.component);
    componentRef.setInput('message', `createComponent: ${option.message}`);
  }
}
