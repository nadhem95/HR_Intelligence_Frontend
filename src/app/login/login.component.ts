import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';
import { Condidat } from '../Entites/Condidat.Entites';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  messageCommande=""
  loginForm: FormGroup
    constructor(
      private fb: FormBuilder,
      private service:CrudService,
      private router:Router
    ) { 
      let formControls = {
        email: new FormControl('',[
          Validators.required,
          Validators.email
          
        ]),
        mot_de_passe: new FormControl('',[
          Validators.required,
         
        ])
      }
  
      this.loginForm = this.fb.group(formControls)
    }
  
    get email() { return this.loginForm.get('email') }
    get mot_de_passe() { return this.loginForm.get('mot_de_passe') }
   
    login() {
      let data = this.loginForm.value;
      console.log(data);
      let condidat = new Condidat(
       null, null,null,data.email,data.mot_de_passe,null);
      console.log(Condidat);
      if (
    
        data.email == 0 ||
        data.mot_de_passe == 0
      )
      {
        this.messageCommande=`<div class="alert alert-success" role="alert">
        remplir votre champ
      </div>`
      } else {
    
        this.service.loginCondidat(condidat).subscribe(
          res=>{

            console.log(res);
            this.messageCommande=`<div class="alert alert-success" role="alert">
        Login avec success
      </div>`
            let token = res.token;
            localStorage.setItem("myToken",token);
            this.router.navigate(['/']).then(()=>{window.location.reload()});
          },
          err=>{
            console.log(err);
            this.messageCommande=`<div class="alert alert-success" role="alert">
            erreur
          </div>`
            
          }
        )
        
      }
      }
  


}
