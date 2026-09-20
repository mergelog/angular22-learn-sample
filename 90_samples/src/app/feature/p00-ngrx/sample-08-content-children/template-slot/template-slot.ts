import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PTemplate } from './p-template';

@Component({
  selector: 'app-sample-08-template-slot',
  imports: [NgTemplateOutlet],
  templateUrl: './template-slot.html',
  styleUrl: './template-slot.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateSlot {
  // [■観点:contentChild] 投影された最初の PTemplate を Signal として取得する。
  readonly firstTemplate = contentChild(PTemplate);

  // [■観点:contentChildren] 投影された全 PTemplate を取得し、名前で使い分ける。
  readonly templates = contentChildren(PTemplate);

  readonly headerTemplate = computed(() => this.findTemplate('header'));
  readonly itemTemplate = computed(() => this.findTemplate('item'));

  private findTemplate(name: string): PTemplate | undefined {
    return this.templates().find((template) => template.name() === name);
  }
}
