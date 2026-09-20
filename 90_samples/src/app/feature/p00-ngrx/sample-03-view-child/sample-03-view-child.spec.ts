import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sample03ViewChild } from './sample-03-view-child';

describe('Sample03ViewChild', () => {
  let component: Sample03ViewChild;
  let fixture: ComponentFixture<Sample03ViewChild>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sample03ViewChild],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sample03ViewChild);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('queries the always-present child and its initial task', () => {
    expect(component.workspace().taskCount()).toBe(1);
    expect(component.workspace().primaryTask().title()).toBe('最初のタスク');
  });

  it('updates viewChildren when the conditional task is rendered', () => {
    component.workspace().toggleExtraTask();
    fixture.detectChanges();

    expect(component.workspace().taskCount()).toBe(2);
  });

  it('can call a grandchild method through the child query chain', () => {
    component.archivePrimaryThroughChain();

    expect(component.workspace().primaryTask().isArchived()).toBe(true);
  });
});
