import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { P04StoreNavi } from '../layout/p04-store-navi/p04-store-navi';
import { SimpleInput } from './simple-input/simple-input';

@Component({
  selector: 'app-learn-01-cva',
  imports: [P04StoreNavi, ReactiveFormsModule, SimpleInput],
  templateUrl: './learn-01-cva.html',
  styleUrl: './learn-01-cva.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Learn01Cva {
  readonly name = new FormControl('Angular', { nonNullable: true });

  reset(): void {
    this.name.setValue('Angular');
  }
}
