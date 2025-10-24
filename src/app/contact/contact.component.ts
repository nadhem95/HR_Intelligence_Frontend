import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Contact } from '../Entites/Contact.Entites';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  messageCommande=""
    contactForm:FormGroup
    
    userFile: any;
    public imagePath: any;
    emailURL: any
    newProduit=new Contact()
    
    constructor(private services : CrudService , private router : Router,private fb:FormBuilder) {
      let formControls = {
        nom: new FormControl('',[
          Validators.required,
        Validators.minLength(4)]),
          telephone: new FormControl('',[
            Validators.required,]),
      
        email: new FormControl('',[
          Validators.required,
        Validators.email]),
        sujet: new FormControl('',[
          Validators.required,]),
       message: new FormControl('',[
            Validators.required,])}
       this.contactForm = this.fb.group(formControls)
     }
     get nom() {return this.contactForm.get('nom');} 
     get telephone() {return this.contactForm.get('telephone');} 
    get email() { return this.contactForm.get('email');}
    get sujet() {return this.contactForm.get('sujet');}
    get message() {return this.contactForm.get('message');}
    
     addNewContact() {
      let data = this.contactForm.value;
      console.log(data);
      let contact = new Contact(
       undefined, data.nom,data.telephone,data.email,data.sujet,data.message);
      console.log(contact);
      
      if (
        data.nom== 0 ||
        data.telephone == 0 ||
        data.email == 0||
        data.sujet == 0||
        data.message == 0
      ) {
        this.messageCommande=`<div class="alert alert-danger" role="alert">
        remplir votre champ 
      </div>`
      
      } else {
      this.services.addcontact(contact).subscribe(
        res=>{
          console.log(res);
          this.messageCommande=`<div class="alert alert-success" role="alert">
          avec success
        </div>`
          
          this.router.navigate(['']).then(()=>{window.location.reload()})
          ;
        },
         err=>{
          this.messageCommande=`<div class="alert alert-warning" role="alert">
          EMAIL EXISTE deja!!!! 
        </div>`
    
        })
        setTimeout(() => {
          this.messageCommande=""
        }, 3000);
      
      }
    }
  
  
  
    ngOnInit(): void {
    }
  
  }
  
  
  
  

