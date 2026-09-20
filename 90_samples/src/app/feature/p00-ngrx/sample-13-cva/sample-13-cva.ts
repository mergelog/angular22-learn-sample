import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { Priority, PriorityControl } from './priority-control/priority-control';

@Component({
  selector: 'app-sample-13-cva',
  imports: [P00NgrxNavi, PriorityControl, ReactiveFormsModule],
  templateUrl: './sample-13-cva.html',
  styleUrl: './sample-13-cva.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample13Cva {
  readonly priority = new FormControl<Priority>('medium', { nonNullable: true });
  readonly priorityValue = toSignal(this.priority.valueChanges, {
    initialValue: this.priority.value,
  });

  toggleDisabled(): void {
    if (this.priority.disabled) {
      this.priority.enable();
    } else {
      this.priority.disable();
    }
  }

  reset(): void {
    this.priority.reset('medium');
  }
}
