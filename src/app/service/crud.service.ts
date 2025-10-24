import { Injectable } from '@angular/core';
import { Condidat } from '../Entites/Condidat.Entites';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../Entites/Contact.Entites';
import { Offre } from '../Entites/Offre.Entites';
import { Postulation } from '../Entites/Postulation.Entites';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class CrudService {

  apiUrl = 'http://localhost:8081/api';
  loginUserUrl = 'http://localhost:8081/api/condidat/login';

  constructor(private http: HttpClient) {}

  loginCondidat(condidat: Condidat) {
    return this.http.post<any>(this.loginUserUrl, condidat);
  }

  addcondidat(condidat: Condidat) {
    return this.http.post<any>(this.apiUrl + "/condidat", condidat);
  }

  /**
   * Add candidat with photo using FormData
   * @param candidatData - Candidat information
   * @param photo - File object for the photo
   */
  addCondidatWithPhoto(candidatData: any, photo?: File): Observable<any> {
    const formData = new FormData();
    
    // Add candidat data to FormData
    formData.append('nom', candidatData.nom);
    formData.append('prenom', candidatData.prenom);
    formData.append('email', candidatData.email);
    formData.append('mot_de_passe', candidatData.mot_de_passe);
    formData.append('telephone', candidatData.telephone);
    formData.append('adresse', candidatData.adresse);
    
    // Add photo if provided
    if (photo) {
      formData.append('photo', photo);
    }
    
    return this.http.post<any>(`${this.apiUrl}/condidat/with-photo`, formData);
  }

  getCandidat(): Observable<Condidat[]> {
    return this.http.get<Condidat[]>(`${this.apiUrl}/condidat`);
  }

  getCandidatById(id: number): Observable<Condidat> {
    return this.http.get<Condidat>(`${this.apiUrl}/condidat/${id}`);
  }

  modifierCandidat(candidat: Condidat): Observable<Condidat> {
    return this.http.put<Condidat>(`${this.apiUrl}/condidat/${candidat.id}`, candidat);
  }

  /**
   * Update candidat with photo using FormData
   * @param id - Candidat ID
   * @param candidatData - Candidat information
   * @param photo - File object for the photo (optional)
   */
  modifierCondidatWithPhoto(id: number, candidatData: any, photo?: File): Observable<any> {
  const formData = new FormData();
  
  // Add candidat data to FormData
  formData.append('nom', candidatData.nom);
  formData.append('prenom', candidatData.prenom);
  formData.append('email', candidatData.email);
  formData.append('telephone', candidatData.telephone);
  formData.append('adresse', candidatData.adresse);
  
  // Ne pas ajouter le mot de passe s'il n'est pas fourni
  // formData.append('mot_de_passe', candidatData.mot_de_passe); ← Supprimez cette ligne
  
  // Add photo if provided
  if (photo) {
    formData.append('photo', photo);
  }
  
  return this.http.put<any>(`${this.apiUrl}/condidat/${id}/with-photo`, formData);
}

  addcontact(contact: Contact) {
    return this.http.post<any>(this.apiUrl + "/contact", contact);
  }

  getAllOffres(): Observable<Offre[]> {
    return this.http.get<Offre[]>(this.apiUrl + "/offre");
  }

  getOffreById(offreId: any): Observable<Offre> {
    return this.http.get<Offre>(this.apiUrl + "/offre/" + offreId);
  }

  addpostulation(event: any) {
    return this.http.post<any>(this.apiUrl + "/postulation", event);
  }

  deletePostulation(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/postulation/${id}`);
  }

  getUserInfo() {
    var token = localStorage.getItem("myToken");
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);
    return decodedToken?.data;
  }

  getAllPostulationbyCandidatId() {
    return this.http.get<any>("http://localhost:8081/api/postulation/get-all-by-id-Client/" + this.getUserInfo()?.id);
  }

  /** Interview Management */
  bookInterview(postulationId: number, bookingData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/postulation/${postulationId}/book-interview`, bookingData);
  }

  getBookedInterviewsByCandidat(candidatId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/postulation/candidat/${candidatId}/interviews`);
  }

  cancelInterview(postulationId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/postulation/${postulationId}/cancel-interview`, {});
  }

  /**
   * Get all interviews for admin
   * @returns Observable<Postulation[]> - List of all interviews
   */
  getAllInterviews(): Observable<Postulation[]> {
    return this.http.get<Postulation[]>(`${this.apiUrl}/postulation/admin/interviews`);
  }

  /**
   * Get interviews by specific date
   * @param date - Date string (YYYY-MM-DD format)
   * @returns Observable<Postulation[]> - List of interviews for the specified date
   */
  getInterviewsByDate(date: string): Observable<Postulation[]> {
    return this.http.get<Postulation[]>(`${this.apiUrl}/postulation/admin/interviews/date/${date}`);
  }

  /**
   * Get interviews within a date range
   * @param startDate - Start date string (YYYY-MM-DD format)
   * @param endDate - End date string (YYYY-MM-DD format)
   * @returns Observable<Postulation[]> - List of interviews within the date range
   */
  getInterviewsByDateRange(startDate: string, endDate: string): Observable<Postulation[]> {
    return this.http.get<Postulation[]>(`${this.apiUrl}/postulation/admin/interviews/range`, {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    });
  }

  /**
   * Update interview status
   * @param id - Postulation ID
   * @param status - New status
   * @returns Observable<Postulation> - Updated postulation
   */
  updateInterviewStatus(id: number, status: string): Observable<Postulation> {
    return this.http.put<Postulation>(`${this.apiUrl}/postulation/admin/interviews/${id}/status`, { status });
  }

  /**
   * Reschedule interview
   * @param id - Postulation ID
   * @param rescheduleData - Object containing new date and time slot
   * @returns Observable<Postulation> - Updated postulation
   */
  rescheduleInterview(id: number, rescheduleData: { interviewDate: string; interviewTimeSlot: string }): Observable<Postulation> {
    return this.http.put<Postulation>(`${this.apiUrl}/postulation/admin/interviews/${id}/reschedule`, rescheduleData);
  }

  isLoggedIn() {
    let token = localStorage.getItem("myToken");
    return !!token;
  }

  /**
   * Helper method to validate image file
   * @param file - File to validate
   * @returns boolean indicating if file is valid
   */
  validateImageFile(file: File): { isValid: boolean; message?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, message: 'Only image files are allowed!' };
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { isValid: false, message: 'Image size must be less than 5MB!' };
    }
    
    return { isValid: true };
  }

  /**
   * Helper method to convert file to base64 (if needed for display)
   * @param file - File to convert
   * @returns Promise<string> - Base64 string
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  /**
 * Get candidat photo by ID
 * @param id - Candidat ID
 */
getCandidatPhoto(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/condidat/${id}/photo`);
}
}