import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sample01InOut } from './sample-01-in-out';

describe('Sample01InOut', () => {
  let component: Sample01InOut;
  let fixture: ComponentFixture<Sample01InOut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample01InOut],
    }).compileComponents();

    fixture = TestBed.createComponent(Sample01InOut);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('receives a message from the child', () => {
    component.receiveMessage('テスト通知');

    expect(component.messageFromChild()).toBe('テスト通知');
  });
});
