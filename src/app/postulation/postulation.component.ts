import { Component } from '@angular/core';
import { Postulation } from '../Entites/Postulation.Entites';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { CvAnalysisService } from '../service/cv-analysis.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Offre } from '../Entites/Offre.Entites';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-postulation',
  templateUrl: './postulation.component.html',
  styleUrls: ['./postulation.component.css']
})
export class PostulationComponent {
  user: any;
  userFile: any;
  message?: String;
  imgURL: any;
  imagePath: any;
  offreId: any;
  cvForm: FormGroup;
  selectedFile: File | null = null;
  IsloggedIn: boolean;
  offreDetails: any;
  isAnalyzing: boolean = false;
  analysisResult: any = null;
  chartImageSafe: SafeResourceUrl | null = null;

  constructor(
    private service: CrudService,
    private router: Router,
    private fb: FormBuilder,
    private rout: ActivatedRoute,
    private cvAnalysisService: CvAnalysisService,
    private sanitizer: DomSanitizer
  ) {
    this.cvForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneno: ['', Validators.required],
      designation: ['', Validators.required],
      address: ['', Validators.required],
      summary: ['', Validators.required],
      skills: this.fb.array([]),
      experiences: this.fb.array([]),
      educations: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.user = localStorage.getItem("user");
    this.offreId = this.rout.snapshot.params['id'];
    this.IsloggedIn = this.service.isLoggedIn();
    
    if (this.offreId) {
      this.loadOffreDetails();
    }
  }

  loadOffreDetails() {
    this.service.getOffreById(this.offreId).subscribe(
      (data: Offre) => {
        this.offreDetails = data;
      },
      (err: any) => {
        console.error('Erreur lors du chargement des détails de l\'offre', err);
      }
    );
  }

  postulation() {
    this.message = `<div class="alert alert-primary" role="alert">En cours de téléchargement...</div>`;
    
    if (this.imgURL != undefined) {
      if (this.offreDetails && this.selectedFile) {
        this.isAnalyzing = true;
        
        // Utiliser le service mis à jour
        this.cvAnalysisService.extractTextFromFile(this.selectedFile).subscribe(
          (text) => {
            if (!text) {
              this.isAnalyzing = false;
              this.submitPostulation(null);
              return;
            }
            
            const requiredSkills = this.extractSkillsFromOffre(this.offreDetails);
            
            this.cvAnalysisService.analyzeCV(
              text, 
              this.offreDetails.description || '', 
              requiredSkills
            ).subscribe(
              (result) => {
                if (result) {
                  this.analysisResult = result;
                  
                  if (result.chart_image) {
                    this.chartImageSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
                      'data:image/png;base64,' + result.chart_image
                    );
                  }
                }
                
                this.submitPostulation(result);
              },
              (err) => {
                console.error('Erreur lors de l\'analyse du CV', err);
                this.isAnalyzing = false;
                this.submitPostulation(null);
              }
            );
          },
          (err) => {
            console.error('Erreur lors de l\'extraction du texte', err);
            this.isAnalyzing = false;
            this.submitPostulation(null);
          }
        );
      } else {
        this.submitPostulation(null);
      }
    }
  }

  private extractSkillsFromOffre(offre: any): string[] {
    if (offre.skills && Array.isArray(offre.skills)) {
      return offre.skills;
    } else if (offre.skills && typeof offre.skills === 'string') {
      return offre.skills.split(',').map((s: string) => s.trim());
    } else if (offre.description) {
      const commonSkills = ['javascript', 'html', 'css', 'angular', 'react', 'vue', 'node', 
        'php', 'java', 'python', 'c#', '.net', 'sql', 'mongodb', 'agile', 'scrum'];
      
      return commonSkills.filter(skill => 
        offre.description.toLowerCase().includes(skill)
      );
    }
    
    return [];
  }

  private submitPostulation(analysisResult: any) {
    let RQ: any = {};
    RQ.idOffre = this.offreId;
    RQ.idCondidat = this.service.getUserInfo()?.id;
    RQ.cv = this.imgURL;
    
    // Utiliser les nouveaux champs ajoutés dans PostulationRq
    if (analysisResult) {
      const resultForStorage = {...analysisResult};
      delete resultForStorage.chart_image;
      
      RQ.analysisResult = JSON.stringify(resultForStorage);
      RQ.matchScore = analysisResult.total_score;
    }
    
    this.service.addpostulation(RQ).subscribe(
      (data) => {
        this.isAnalyzing = false;
        this.message = `<div class="alert alert-success" role="alert">Ajouté avec succès...</div>`;
        this.rediract();
      },
      (err) => {
        this.isAnalyzing = false;
        this.message = `<div class="alert alert-danger" role="alert">Échec d'ajout</div>`;
        this.rediract();
      }
    );
  }

  rediract() {
    setTimeout(() => {
      this.message = "";
      this.router.navigate(["/mespostulation"]).then(() => {
        window.location.reload();
      });
    }, 3000);
  }

  OnSelectFile(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.userFile = file;
      this.selectedFile = file;
      var mimeType = event.target.files[0].type;
      var reader = new FileReader();
      this.imagePath = file;
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
      };
    }
  }

  // Reste des méthodes inchangées
  // ...
}