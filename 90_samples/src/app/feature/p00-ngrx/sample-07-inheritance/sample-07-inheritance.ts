import { ChangeDetectionStrategy, Component } from '@angular/core';
import { P00NgrxNavi } from '../layout/p00-ngrx-navi/p00-ngrx-navi';
import { ExtendedNoticeCard } from './extended-notice-card/extended-notice-card';
import { StandardNoticeCard } from './standard-notice-card/standard-notice-card';

@Component({
  selector: 'app-sample-07-inheritance',
  imports: [P00NgrxNavi, StandardNoticeCard, ExtendedNoticeCard],
  templateUrl: './sample-07-inheritance.html',
  styleUrl: './sample-07-inheritance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sample07Inheritance {}
