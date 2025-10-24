import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesPostulationComponent } from './mes-postulation.component';

describe('MesPostulationComponent', () => {
  let component: MesPostulationComponent;
  let fixture: ComponentFixture<MesPostulationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesPostulationComponent]
    });
    fixture = TestBed.createComponent(MesPostulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
