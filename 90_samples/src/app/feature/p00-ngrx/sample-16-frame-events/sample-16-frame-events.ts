import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  signal,
  viewChild,
} from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';

interface FrameMessage {
  readonly source: 'sample-16-frame';
  readonly type: 'ready' | 'pong';
  readonly payload?: string;
}

@Component({
  selector: 'app-sample-16-frame-events',
  imports: [P00NgrxNavi],
  templateUrl: './sample-16-frame-events.html',
  styleUrl: './sample-16-frame-events.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample16FrameEvents {
  readonly frameReady = signal(false);
  readonly lastFrameMessage = signal('iframe からの応答待ち');
  readonly lastDocumentEvent = signal('この画面で Escape キーを押してください');

  private readonly demoFrame = viewChild.required<ElementRef<HTMLIFrameElement>>('demoFrame');

  sendPing(messageInput: HTMLInputElement): void {
    const target = this.demoFrame().nativeElement.contentWindow;
    target?.postMessage(
      {
        source: 'sample-16-parent',
        type: 'ping',
        payload: messageInput.value,
      },
      window.location.origin,
    );
  }

  // [■観点:postMessage受信] origin・送信元window・dataの形を検証してから利用する。
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent<unknown>): void {
    const expectedWindow = this.demoFrame().nativeElement.contentWindow;
    if (event.origin !== window.location.origin || event.source !== expectedWindow) return;
    if (!this.isFrameMessage(event.data)) return;

    if (event.data.type === 'ready') {
      this.frameReady.set(true);
      this.lastFrameMessage.set('iframe の準備完了');
      return;
    }

    this.lastFrameMessage.set(`iframe の応答: ${event.data.payload ?? ''}`);
  }

  // [■観点:document event] Component 外の document に届くイベントも HostListener で購読できる。
  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(_event: Event): void {
    this.lastDocumentEvent.set(`document が Escape を受信 (${new Date().toLocaleTimeString()})`);
  }

  private isFrameMessage(value: unknown): value is FrameMessage {
    if (typeof value !== 'object' || value === null) return false;

    const candidate = value as Partial<FrameMessage>;
    return (
      candidate.source === 'sample-16-frame' &&
      (candidate.type === 'ready' || candidate.type === 'pong') &&
      (candidate.payload === undefined || typeof candidate.payload === 'string')
    );
  }
}
