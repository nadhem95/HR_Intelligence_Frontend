import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvAnalysisTestComponent } from './cv-analysis-test.component';

describe('CvAnalysisTestComponent', () => {
  let component: CvAnalysisTestComponent;
  let fixture: ComponentFixture<CvAnalysisTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CvAnalysisTestComponent]
    });
    fixture = TestBed.createComponent(CvAnalysisTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
