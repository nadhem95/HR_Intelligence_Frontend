import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Condidat } from '../Entites/Condidat.Entites';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  messageCommande = ""
  registerForm: FormGroup
  
  // Variables pour la gestion de l'image
  selectedFile: File | null = null;
  profileImagePreview: string | null = null;
  photoError: string = '';
  
  userFile: any;
  public imagePath: any;
  emailURL: any
  newProduit = new Condidat()
  public message!: string;
  
  constructor(private services: CrudService, private router: Router, private fb: FormBuilder) {
    let formControls = {
      nom: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ]),
      prenom: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      mot_de_passe: new FormControl('', [
        Validators.required,
      ]),
      telephone: new FormControl('', [
        Validators.required,
      ]),
      adresse: new FormControl('', [
        Validators.required,
      ]),
    }
    this.registerForm = this.fb.group(formControls)
  }
  
  get nom() { return this.registerForm.get('nom'); }
  get prenom() { return this.registerForm.get('prenom'); }
  get email() { return this.registerForm.get('email'); }
  get mot_de_passe() { return this.registerForm.get('mot_de_passe'); }
  get telephone() { return this.registerForm.get('telephone'); }
  get adresse() { return this.registerForm.get('adresse'); }

  // Méthode pour gérer la sélection de fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.photoError = '';
    
    if (file) {
      // Use the validation method from CrudService
      const validation = this.services.validateImageFile(file);
      
      if (!validation.isValid) {
        this.photoError = validation.message || 'Invalid file';
        this.selectedFile = null;
        this.profileImagePreview = null;
        return;
      }
      
      this.selectedFile = file;
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove the old convertFileToBase64 method as we're now using FormData

  async addNewCondidat() {
    let data = this.registerForm.value;
    console.log(data);

    // Validate required fields
    if (
      !data.nom || 
      !data.prenom || 
      !data.email || 
      !data.mot_de_passe || 
      !data.telephone || 
      !data.adresse
    ) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
        Veuillez remplir tous les champs obligatoires
      </div>`
      return;
    }

    // Use the new addCondidatWithPhoto method from CrudService
    this.services.addCondidatWithPhoto(data, this.selectedFile || undefined).subscribe(
      res => {
        console.log(res);
        this.messageCommande = `<div class="alert alert-success" role="alert">
          Inscription réussie avec succès
        </div>`

        // Reset form and photo
        this.registerForm.reset();
        this.selectedFile = null;
        this.profileImagePreview = null;

        // Redirection vers la page de connexion
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      err => {
        console.error(err);
        this.messageCommande = `<div class="alert alert-warning" role="alert">
          ${err.error?.message || 'EMAIL EXISTE déjà !!!!'}
        </div>`
      }
    );
    
    setTimeout(() => {
      this.messageCommande = ""
    }, 3000);
  }

  // Method to remove selected photo
  removePhoto() {
    this.selectedFile = null;
    this.profileImagePreview = null;
    this.photoError = '';
  }

  ngOnInit(): void {
  }
}