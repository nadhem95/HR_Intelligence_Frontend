import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-resume-builder',
  templateUrl: './resume-builder.component.html',
  styleUrls: ['./resume-builder.component.css'],
  encapsulation: ViewEncapsulation.None // Add this to ensure styles are preserved when printing
})
export class ResumeBuilderComponent {
  cvForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  showSignature: boolean = false;
  generatedSignature: string = '';
  signatureDate: string = '';

  constructor(private fb: FormBuilder) {
    this.cvForm = this.fb.group({
      firstname: ['', Validators.required],
      middlename: [''],
      lastname: ['', Validators.required],
      image: [null],
      designation: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneno: ['', Validators.required],
      summary: ['', Validators.required],
      includeSignature: [false],
      achievements: this.fb.array([]),
      experiences: this.fb.array([]),
      educations: this.fb.array([]),
      projects: this.fb.array([]),
      skills: this.fb.array([])
    });

    // Add first element to each dynamic section
    this.addAchievement();
    this.addExperience();
    this.addEducation();
    this.addProject();
    this.addSkill();
  }

  // Generate invisible signature metadata
  generateInvisibleSignature(): string {
    const timestamp = new Date().toISOString();
    const userInfo = `${this.cvForm.value.firstname}_${this.cvForm.value.lastname}_${this.cvForm.value.email}`;
    const randomSalt = Math.random().toString(36).substring(2, 15);
    
    // Create a hash-like signature
    const signatureData = btoa(userInfo + timestamp + randomSalt).substring(0, 32);
    
    return signatureData;
  }

  // Generate verification hash
  generateVerificationHash(): string {
    const cvData = JSON.stringify({
      name: `${this.cvForm.value.firstname} ${this.cvForm.value.lastname}`,
      email: this.cvForm.value.email,
      designation: this.cvForm.value.designation,
      timestamp: new Date().toISOString()
    });
    
    return CryptoJS.SHA256(cvData).toString(CryptoJS.enc.Hex).substring(0, 24);
  }

  // Toggle signature method
  toggleSignature(): void {
    this.showSignature = this.cvForm.get('includeSignature')?.value;
    if (this.showSignature) {
      this.generateSignature();
    }
  }

  // Generate a random signature and current date
  generateSignature(): void {
    // Generate a random alphanumeric signature
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.generatedSignature = result;
    
    // Format current date
    const today = new Date();
    this.signatureDate = today.toLocaleDateString();
  }

  // Getters for FormArrays
  get achievements() {
    return this.cvForm.get('achievements') as FormArray;
  }

  get experiences() {
    return this.cvForm.get('experiences') as FormArray;
  }

  get educations() {
    return this.cvForm.get('educations') as FormArray;
  }

  get projects() {
    return this.cvForm.get('projects') as FormArray;
  }

  get skills() {
    return this.cvForm.get('skills') as FormArray;
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Methods to add dynamic elements
  addAchievement() {
    this.achievements.push(this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    }));
  }

  addExperience() {
    this.experiences.push(this.fb.group({
      title: ['', Validators.required],
      organization: ['', Validators.required],
      location: [''],
      startDate: [''],
      endDate: [''],
      description: ['']
    }));
  }

  addEducation() {
    this.educations.push(this.fb.group({
      school: ['', Validators.required],
      degree: ['', Validators.required],
      city: [''],
      startDate: [''],
      graduationDate: [''],
      description: ['']
    }));
  }

  addProject() {
    this.projects.push(this.fb.group({
      title: ['', Validators.required],
      link: [''],
      description: ['']
    }));
  }

  addSkill() {
    this.skills.push(this.fb.group({
      skill: ['', Validators.required]
    }));
  }

  // Method to remove dynamic elements
  removeItem(formArray: FormArray, index: number) {
    formArray.removeAt(index);
  }

  onSubmit() {
    if (this.cvForm.valid) {
      console.log(this.cvForm.value);
      // Send data to server or process CV
    } else {
      this.cvForm.markAllAsTouched();
    }
  }

  printCV() {
    // Pre-generate signature if it's enabled but not yet generated
    if (this.cvForm.get('includeSignature')?.value && !this.generatedSignature) {
      this.generateSignature();
    }
    
    // Add a brief timeout to ensure DOM is fully rendered before printing
    setTimeout(() => {
      // Add print-specific style tag to document
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = `
        @media print {
          body * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .verification-section {
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-container, .print-container * {
            visibility: visible !important;
          }
          .no-print {
            display: none !important;
          }
          img, .signature-box {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      window.print();
      
      // Clean up - remove the style element after printing
      setTimeout(() => document.head.removeChild(style), 1000);
    }, 300);
  }

  // New method to download PDF with invisible signature
  async downloadPDFWithSignature(): Promise<void> {
    if (!this.cvForm.valid) {
      this.cvForm.markAllAsTouched();
      return;
    }

    try {
      // Get the CV content element (adjust selector based on your HTML)
      const cvElement = document.querySelector('.cv-content') || document.querySelector('.print-container') || document.body;
      
      if (!cvElement) {
        console.error('CV content element not found');
        return;
      }

      // Generate canvas from HTML
      const canvas = await html2canvas(cvElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate invisible signature metadata
      const invisibleSignature = this.generateInvisibleSignature();
      const verificationHash = this.generateVerificationHash();
      const timestamp = new Date().toISOString();
      
      // Add invisible metadata to PDF
      const metadata = {
        'CVBuilder_Signature': invisibleSignature,
        'Verification_Hash': verificationHash,
        'Creation_Date': timestamp,
        'Candidate_ID': btoa(`${this.cvForm.value.firstname}_${this.cvForm.value.lastname}`),
        'Designation': btoa(this.cvForm.value.designation), // Added designation
        'Platform': 'CVBuilder_v1.0',
        'Email_Hash': btoa(this.cvForm.value.email),
        'Verification_URL': 'https://yoursite.com/verify/' + verificationHash
      };

      // Set PDF metadata (invisible to users)
      pdf.setDocumentProperties({
        title: `CV_${this.cvForm.value.firstname}_${this.cvForm.value.lastname}`,
        subject: 'Professional Resume',
        author: `${this.cvForm.value.firstname} ${this.cvForm.value.lastname}`,
        keywords: 'CV, Resume, Professional',
        creator: 'CVBuilder Platform',
        ...metadata
      });

      // Save the PDF
      const fileName = `CV_${this.cvForm.value.firstname}_${this.cvForm.value.lastname}_${Date.now()}.pdf`;
      pdf.save(fileName);

      // Optional: Store signature data in your backend for verification
      this.storeSignatureData({
        signature: invisibleSignature,
        hash: verificationHash,
        timestamp: timestamp,
        candidateName: `${this.cvForm.value.firstname} ${this.cvForm.value.lastname}`,
        email: this.cvForm.value.email,
        fileName: fileName
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }

  // Store signature data for later verification (implement based on your backend)
  private storeSignatureData(signatureData: any): void {
    // TODO: Implement API call to store signature data in your backend
    console.log('Signature data to store:', signatureData);
    
    // Example API call:
    // this.http.post('/api/signatures', signatureData).subscribe(
    //   response => console.log('Signature stored successfully'),
    //   error => console.error('Error storing signature:', error)
    // );
  }

  generateCVWithSignature(): void {
    // Générer une signature unique
    this.generateSignature();
    
    // Créer un contenu de signature détaillé
    const signatureContent = `
      Digital Verification
      -------------------------
      Candidate: ${this.cvForm.value.firstname} ${this.cvForm.value.lastname}
      Date: ${this.signatureDate}
      Authentication Code: ${this.generatedSignature}
      Verify this CV at: verify.cvbuilder.com
      -------------------------
      Created with CV Builder
    `;
  }
}