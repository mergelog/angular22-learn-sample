import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-newc',
  styleUrl: './newc.scss',
  templateUrl: './newc.html',
})
export class Newc {

  readonly aaa = signal(0);

  changeA() {
    this.aaa.set(123)
  }


}
