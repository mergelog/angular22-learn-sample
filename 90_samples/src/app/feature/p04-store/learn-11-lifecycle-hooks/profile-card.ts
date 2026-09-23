import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  contentChild,
  input,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  template: `
    <section>
      <h2 #titleElement tabindex="-1">子コンポーネント内部のタイトル</h2>

      <p>userId: {{ userId() }}</p>

      <div>
        <ng-content />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent implements OnInit, AfterContentInit, AfterViewInit {
  // 親コンポーネントから受け取る必須の値
  readonly userId = input.required<number>();

  // 親から ng-content で渡された要素
  readonly projectedMessage = contentChild<ElementRef<HTMLParagraphElement>>('message');

  // 子自身のテンプレート内にある要素
  readonly titleElement = viewChild<ElementRef<HTMLHeadingElement>>('titleElement');

  constructor() {
    console.log('1. constructor');

    // Angular が input を設定する前なので、
    // 必須 input の userId() はまだ読まない

    console.log('contentChild:', this.projectedMessage());
    // undefined

    console.log('viewChild:', this.titleElement());
    // undefined
  }

  ngOnInit(): void {
    console.log('2. ngOnInit');

    console.log('userId:', this.userId());
    // 100

    // input の初期値はすでに使える
  }

  ngAfterContentInit(): void {
    console.log('3. ngAfterContentInit');

    console.log('projected content:', this.projectedMessage()?.nativeElement.textContent);

    // 親から ng-content で渡された要素を使える
  }

  ngAfterViewInit(): void {
    console.log('4. ngAfterViewInit');

    console.log('view:', this.titleElement()?.nativeElement.textContent);

    // 子自身のテンプレート内にある要素を使える
    this.titleElement()?.nativeElement.focus();
  }
}
