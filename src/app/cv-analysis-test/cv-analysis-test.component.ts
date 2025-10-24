import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CvAnalysisService } from '../service/cv-analysis.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-cv-analysis-test',
  templateUrl: './cv-analysis-test.component.html',
  styleUrls: ['./cv-analysis-test.component.css']
})
export class CvAnalysisTestComponent implements OnInit {
  testForm: FormGroup;
  loading = false;
  cvText = '';
  analysisResult: any = null;
  chartImage: SafeHtml | null = null;
  activeTab = 'upload'; // 'upload' or 'text'
  fileSelected = false;
  selectedFileName = '';

  constructor(
    private fb: FormBuilder,
    private cvAnalysisService: CvAnalysisService,
    private sanitizer: DomSanitizer
  ) {
    this.testForm = this.fb.group({
      jobDescription: ['', Validators.required],
      skills: this.fb.array([this.createSkillControl()]),
      manualCvText: ['']
    });
  }

  ngOnInit(): void {}

  get skills(): FormArray {
    return this.testForm.get('skills') as FormArray;
  }

  createSkillControl() {
    return this.fb.control('', Validators.required);
  }

  addSkill() {
    this.skills.push(this.createSkillControl());
  }

  removeSkill(index: number) {
    if (this.skills.length > 1) {
      this.skills.removeAt(index);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileSelected = true;
      this.selectedFileName = file.name;
      this.loading = true;
      
      this.cvAnalysisService.extractTextFromFile(file).subscribe(
        text => {
          this.cvText = text;
          this.loading = false;
        },
        error => {
          console.error('Error extracting text from PDF:', error);
          this.loading = false;
          alert('Failed to extract text from PDF. Please try again or paste the CV text manually.');
        }
      );
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'text') {
      this.fileSelected = false;
    }
  }

  onSubmit() {
    if (this.testForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    // Get final CV text to use
    const finalCvText = this.activeTab === 'upload' ? this.cvText : this.testForm.value.manualCvText;
    
    if (!finalCvText) {
      alert('Please upload a CV or enter CV text manually');
      return;
    }

    const jobDescription = this.testForm.value.jobDescription;
    const requiredSkills = this.skills.value.filter((skill: string) => skill.trim() !== '');

    this.loading = true;
    this.cvAnalysisService.analyzeCV(finalCvText, jobDescription, requiredSkills)
      .subscribe(
        result => {
          this.loading = false;
          this.analysisResult = result;
          
          if (result && result.chart_image) {
            this.chartImage = this.sanitizer.bypassSecurityTrustHtml(
              `<img src="data:image/png;base64,${result.chart_image}" alt="Score chart" class="img-fluid">`
            );
          }
        },
        error => {
          console.error('Error analyzing CV:', error);
          this.loading = false;
          alert('Failed to analyze CV. Please try again later.');
        }
      );
  }

  clearForm() {
    this.testForm.reset();
    this.cvText = '';
    this.analysisResult = null;
    this.chartImage = null;
    this.fileSelected = false;
    this.selectedFileName = '';
    
    // Reset skills to have one empty field
    this.skills.clear();
    this.addSkill();
  }
}