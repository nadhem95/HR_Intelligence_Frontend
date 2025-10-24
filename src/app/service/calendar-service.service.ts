import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CalendarAvailability, TimeSlot } from '../Entites/aziz.entites';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:8081/api/calendar';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`❌ [${operation}] Error:`, error);
      return of(result as T);
    };
  }

  getAllAvailabilities(): Observable<CalendarAvailability[]> {
    return this.http.get<CalendarAvailability[]>(this.apiUrl).pipe(
      tap(response => console.log('✅ Loaded availabilities:', response.length)),
      catchError(this.handleError<CalendarAvailability[]>('getAllAvailabilities', []))
    );
  }

  getAvailabilityByDate(date: Date): Observable<CalendarAvailability> {
    const dateStr = this.formatDate(date);
    return this.http.get<CalendarAvailability>(`${this.apiUrl}/${dateStr}`).pipe(
      catchError(() => of({ date: dateStr, isAvailable: false, timeSlots: [] }))
    );
  }

  saveAvailability(availability: CalendarAvailability): Observable<CalendarAvailability> {
    return this.http.post<CalendarAvailability>(this.apiUrl, availability, this.getHttpOptions()).pipe(
      tap(() => console.log('✅ Saved availability for date:', availability.date)),
      catchError(this.handleError<CalendarAvailability>('saveAvailability'))
    );
  }

  getAvailabilitiesForRange(startDate: Date, endDate: Date): Observable<CalendarAvailability[]> {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);
    const params = new HttpParams()
      .set('startDate', start)
      .set('endDate', end);
  
    return this.http.get<CalendarAvailability[]>(`${this.apiUrl}/range`, { params }).pipe(
      tap(response => console.log('✅ Loaded range availabilities:', response.length)),
      catchError(this.handleError<CalendarAvailability[]>('getAvailabilitiesForRange', []))
    );
  }

  getTimeSlotsByIdAndDate(id: number, date: Date): Observable<TimeSlot[]> {
    const dateStr = this.formatDate(date);
    return this.http.get<TimeSlot[]>(`${this.apiUrl}/${id}/timeslots`, {
      params: new HttpParams().set('date', dateStr)
    }).pipe(
      tap(response => console.log('✅ Loaded time slots for ID:', id, 'Date:', dateStr, 'Slots:', response)),
      catchError(this.handleError<TimeSlot[]>('getTimeSlotsByIdAndDate', []))
    );
  }
  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('✅ Deleted availability for ID:', id)),
      catchError(this.handleError<void>('deleteAvailability'))
    );
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}