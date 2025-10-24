import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule}from '@angular/common/http';
import { ProduitComponent } from './produit/produit.component';
import { OffreComponent } from './offre/offre.component';
import { PostulationComponent } from './postulation/postulation.component';
import { MenuComponent } from './menu/menu.component';
import { MesPostulationComponent } from './mes-postulation/mes-postulation.component';
import { ResumeBuilderComponent } from './resume-builder/resume-builder.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CvAnalysisTestComponent } from './cv-analysis-test/cv-analysis-test.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ContactComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProduitComponent,
    OffreComponent,
    PostulationComponent,
    MenuComponent,
    MesPostulationComponent,
    ResumeBuilderComponent,
    ChatbotComponent,
    CvAnalysisTestComponent,
    UserProfileComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
