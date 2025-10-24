import { Component, OnInit } from '@angular/core';
import { Condidat } from '../Entites/Condidat.Entites';
import { CrudService } from '../service/crud.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  candidat: Condidat = new Condidat();
  editMode: boolean = false;
  profileForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  selectedFile: File | null = null;
  photoUrl: SafeUrl | string = 'assets/default-avatar.png';
  isPhotoLoading: boolean = false;

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCandidatData();
  }

  loadCandidatData(): void {
    const userData = this.crudService.getUserInfo();
    if (userData && userData.id) {
      this.crudService.getCandidatById(userData.id).subscribe({
        next: (data) => {
          this.candidat = data;
          this.profileForm.patchValue({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            adresse: data.adresse
          });
          this.loadCandidatePhoto(userData.id);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des données du candidat', err);
          this.errorMessage = 'Erreur lors du chargement des données du profil';
        }
      });
    }
  }

  loadCandidatePhoto(id: number): void {
    this.isPhotoLoading = true;
    this.crudService.getCandidatPhoto(id).subscribe({
      next: (photoBlob: Blob) => {
        this.createImageFromBlob(photoBlob);
        this.isPhotoLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la photo', err);
        this.photoUrl = 'assets/default-avatar.png';
        this.isPhotoLoading = false;
      }
    });
  }

  createImageFromBlob(blob: Blob): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
    }, false);

    if (blob) {
      reader.readAsDataURL(blob);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.crudService.validateImageFile(file);
      if (!validation.isValid) {
        this.errorMessage = validation.message || 'Fichier non valide';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedFile = null;
  }

  saveChanges(): void {
  if (this.profileForm.valid) {
    const updatedCandidat: Condidat = {
      ...this.candidat,
      nom: this.profileForm.value.nom,
      prenom: this.profileForm.value.prenom,
      email: this.profileForm.value.email,
      telephone: this.profileForm.value.telephone,
      adresse: this.profileForm.value.adresse
      // ← Ne pas inclure mot_de_passe
    };

    if (this.selectedFile) {
      // Mise à jour avec photo
      this.crudService.modifierCondidatWithPhoto(updatedCandidat.id, updatedCandidat, this.selectedFile)
        .subscribe({
          next: (response) => this.handleSuccessResponse(response),
          error: (err) => this.handleError(err)
        });
    } else {
      // Mise à jour sans photo
      this.crudService.modifierCandidat(updatedCandidat)
        .subscribe({
          next: (response) => this.handleSuccessResponse(response),
          error: (err) => this.handleError(err)
        });
    }
  } else {
    this.errorMessage = 'Veuillez remplir tous les champs correctement';
  }
}


  private handleSuccessResponse(response: any): void {
    this.candidat = response;
    this.successMessage = 'Profil mis à jour avec succès !';
    this.editMode = false;
    this.selectedFile = null;

    // Recharger la photo si elle a été modifiée
    if (this.candidat.id && this.selectedFile) {
      this.loadCandidatePhoto(this.candidat.id);
    }
  }

  private handleError(err: any): void {
    console.error('Erreur lors de la mise à jour du profil', err);
    this.errorMessage = 'Erreur lors de la mise à jour du profil';
  }
}
