import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturesLatestComponent } from './fixtures-latest.component';

describe('FixturesLatestComponent', () => {
  let component: FixturesLatestComponent;
  let fixture: ComponentFixture<FixturesLatestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturesLatestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturesLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
