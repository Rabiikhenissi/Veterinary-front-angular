import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinVetComponent } from './join-vet.component';

describe('JoinVetComponent', () => {
  let component: JoinVetComponent;
  let fixture: ComponentFixture<JoinVetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinVetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinVetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
