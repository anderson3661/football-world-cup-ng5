import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureInPlayComponent } from './fixture-in-play.component';

describe('FixtureInPlayComponent', () => {
  let component: FixtureInPlayComponent;
  let fixture: ComponentFixture<FixtureInPlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureInPlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureInPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
