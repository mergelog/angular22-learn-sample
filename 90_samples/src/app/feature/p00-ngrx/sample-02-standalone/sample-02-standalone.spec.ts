import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sample02Standalone } from './sample-02-standalone';

describe('Sample02Standalone', () => {
  let fixture: ComponentFixture<Sample02Standalone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample02Standalone],
    }).compileComponents();

    fixture = TestBed.createComponent(Sample02Standalone);
    await fixture.whenStable();
  });

  it('creates the parent, child, and grandchild component tree', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-lesson-card')).not.toBeNull();
    expect(element.querySelector('app-lesson-status')).not.toBeNull();
    expect(element.querySelector('app-lesson-status')?.textContent).toContain('学習中');
  });

  it('uses the pipe imported by LessonCard', () => {
    const heading = fixture.nativeElement.querySelector('app-lesson-card h3') as HTMLHeadingElement;

    expect(heading.textContent).toContain('STANDALONE COMPONENT');
  });
});
