import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { registerLocaleData } from '@angular/common';
import { RegisterComponent } from './register/register.component';
import { OffreComponent } from './offre/offre.component';
import { PostulationComponent } from './postulation/postulation.component';
import { AuthGuard } from './service/Auth.service';
import { MesPostulationComponent } from './mes-postulation/mes-postulation.component';
import { ResumeBuilderComponent } from './resume-builder/resume-builder.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { CvAnalysisTestComponent } from './cv-analysis-test/cv-analysis-test.component';
import { UserProfileComponent } from './user-profile/user-profile.component';


const routes: Routes = [
 
    { path: '', component: AboutComponent },
    { path: 'contact', component: ContactComponent },
    { path:'home',component:HomeComponent},
    {path:'login',component:LoginComponent},
    {path:'register',component:RegisterComponent},
    {path:'offre',component:OffreComponent},
    {path:'postulation/:id',component:PostulationComponent,canActivate:[AuthGuard]},
    {path:'mespostulation',component:MesPostulationComponent,canActivate:[AuthGuard]},    
    {path:'resumebuilder',component:ResumeBuilderComponent},
    {path:'chatbot',component:ChatbotComponent},
    {path:'cv',component:CvAnalysisTestComponent},
    {path:'user',component:UserProfileComponent},






  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
