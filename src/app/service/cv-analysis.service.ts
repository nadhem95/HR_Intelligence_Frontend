import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CvAnalysisService {
  // URL principale de l'API backend
  private apiUrl = environment.apiUrl;
  
  // URL Flask directe (à utiliser uniquement si nécessaire)
  private flaskApiUrl = environment.flaskApiUrl;

  constructor(private http: HttpClient) {}
  
  // Reste du code inchangé...

  /**
   * Méthode pour extraire le texte d'un fichier PDF via le backend Spring
   */
  extractTextFromFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    // Option 1: Utiliser le backend Spring comme proxy (recommandé)
    return this.http.post<any>(`${this.apiUrl}/cv-analysis/extract-text`, formData).pipe(
      map(response => response.text || ''),
      catchError(error => {
        console.error('Erreur lors de l\'extraction du texte via Spring:', error);
        
        // Si Spring échoue, essayer directement avec Flask (fallback)
        return this.extractTextDirect(file);
      })
    );
  }

  /**
   * Méthode de secours pour extraire le texte directement via l'API Flask
   */
  private extractTextDirect(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.flaskApiUrl}/extract-pdf`, formData).pipe(
      map(response => response.text || ''),
      catchError(error => {
        console.error('Erreur lors de l\'extraction directe du texte:', error);
        return of('');
      })
    );
  }

  /**
   * Analyse le CV par rapport à une offre d'emploi via le backend Spring
   */
  analyzeCV(cvText: string, jobDescription: string, requiredSkills: string[]): Observable<any> {
    const payload = {
      cv_text: cvText,
      job_description: jobDescription,
      required_skills: requiredSkills
    };

    // Option 1: Utiliser le backend Spring comme proxy (recommandé)
    return this.http.post<any>(`${this.apiUrl}/cv-analysis/evaluate`, payload).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'analyse via Spring:', error);
        
        // Si Spring échoue, essayer directement avec Flask (fallback)
        return this.analyzeCVDirect(cvText, jobDescription, requiredSkills);
      })
    );
  }

  /**
   * Méthode de secours pour analyser directement via l'API Flask
   */
  private analyzeCVDirect(cvText: string, jobDescription: string, requiredSkills: string[]): Observable<any> {
    const payload = {
      cv_text: cvText,
      job_description: jobDescription,
      required_skills: requiredSkills
    };

    return this.http.post<any>(`${this.flaskApiUrl}/evaluate`, payload).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'analyse directe:', error);
        return of(null);
      })
    );
  }

  /**
   * Récupère l'analyse d'une postulation existante
   */
  getPostulationAnalysis(postulationId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/postulations/${postulationId}/analysis`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'analyse:', error);
        return of(null);
      })
    );
  }

  /**
   * Déclenche une analyse manuelle pour une postulation existante
   */
  analyzeExistingPostulation(postulationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/postulations/${postulationId}/analyze`, {}).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'analyse de la postulation:', error);
        return of(null);
      })
    );
  }
}