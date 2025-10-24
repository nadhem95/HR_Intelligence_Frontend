import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { CalendarService } from '../service/calendar-service.service';

@Component({
  selector: 'app-mes-postulation',
  templateUrl: './mes-postulation.component.html',
  styleUrls: ['./mes-postulation.component.css']
})
export class MesPostulationComponent implements OnInit {
  listepostulation: any[] = [];
  filteredPostulations: any[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  sortOption: string = 'date-desc';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  showDetailsModal: boolean = false;
  showInterviewModal: boolean = false;
  showConfirmationModal: boolean = false;
  selectedPostulation: any = null;
  currentDate: Date = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth(); // Fixed: Use currentDate
  currentMonthName: string = '';
  calendarDays: any[] = [];
  availableDays: Date[] = [];
  availableAvailabilities: { date: Date, id: number }[] = [];
  selectedDate: Date | null = null;
  availableTimeSlots: string[] = [];
  selectedTimeSlot: string = '';
  noDatesMessage: string = '';
  noSlotsMessage: string = '';
  bookedInterviews: any[] = [];

  constructor(
    private service: CrudService,
    private router: Router,
    private calendarService: CalendarService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.service.getAllPostulationbyCandidatId().subscribe((data: any) => {
      console.log('Postulations loaded:', data);
      this.listepostulation = this.preprocessData(data);
      this.applyFilters();
      setTimeout(() => {
        this.initProgressBars();
      }, 500);
    });
  }

  preprocessData(data: any[]): any[] {
    return data.map(item => {
      if (!item.datePostulation) {
        item.datePostulation = new Date();
      }
      if (item.totalScore !== undefined && item.scoreCV === undefined) {
        item.scoreCV = item.totalScore;
      }
      if (item.chartImage !== undefined && item.graphiqueResultat === undefined) {
        item.graphiqueResultat = item.chartImage;
      }
      if (item.analysisDate !== undefined && item.dateAnalyse === undefined) {
        item.dateAnalyse = item.analysisDate;
      }
      item.interviewBooked = item.interviewDate !== undefined && item.interviewDate !== null;
      return item;
    });
  }

  initProgressBars(): void {
    const progressBars = document.querySelectorAll('.score-progress');
    progressBars.forEach(bar => {
      const width = bar.getAttribute('data-width');
      if (width) {
        (bar as HTMLElement).style.width = width + '%';
      }
    });
  }

  applyFilters(): void {
    let result = [...this.listepostulation].filter(item => {
      const status = item?.status?.toLowerCase();
      return status === 'pending' || status === 'interview' || status === 'rejected';
    });
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item => 
        (item?.offre?.titre?.toLowerCase().includes(term)) || 
        (item?.offre?.nomSoc?.toLowerCase().includes(term)) ||
        (item?.offre?.ville?.toLowerCase().includes(term))
      );
    }
    
    if (this.statusFilter !== 'all') {
      result = result.filter(item => item?.status?.toLowerCase() === this.statusFilter);
    }
    
    switch (this.sortOption) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.datePostulation).getTime() - new Date(a.datePostulation).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.datePostulation).getTime() - new Date(b.datePostulation).getTime());
        break;
      case 'score-desc':
        result.sort((a, b) => (b.scoreCV || b.totalScore || 0) - (a.scoreCV || a.totalScore || 0));
        break;
      case 'score-asc':
        result.sort((a, b) => (a.scoreCV || a.totalScore || 0) - (b.scoreCV || a.totalScore || 0));
        break;
    }
    
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredPostulations = result.slice(startIndex, startIndex + this.itemsPerPage);
    
    setTimeout(() => {
      this.initProgressBars();
    }, 100);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      if (this.currentPage <= 2) {
        endPage = 4;
      } else if (this.currentPage >= this.totalPages - 1) {
        startPage = this.totalPages - 3;
      }
      
      if (startPage > 2) {
        pages.push(null);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < this.totalPages - 1) {
        pages.push(null);
      }
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  getPendingCount(): number {
    return this.listepostulation.filter(item => 
      item?.status?.toLowerCase() === 'pending').length;
  }

  getAcceptedCount(): number {
    return this.listepostulation.filter(item => 
      item?.status?.toLowerCase() === 'interview').length;
  }

  getRejectedCount(): number {
    return this.listepostulation.filter(item => 
      item?.status?.toLowerCase() === 'rejected').length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'interview':
        return 'interview';
      case 'rejected':
        return 'rejected';
      default:
        return 'Non spécifié';
    }
  }

  getScoreBadgeClass(score: number): string {
    if (!score && score !== 0) return 'score-average';
    
    if (score >= 80) {
      return 'score-excellent';
    } else if (score >= 60) {
      return 'score-good';
    } else if (score >= 40) {
      return 'score-average';
    } else {
      return 'score-poor';
    }
  }

  getScoreClass(score: number): string {
    if (!score && score !== 0) return 'average';
    
    if (score >= 80) {
      return 'excellent';
    } else if (score >= 60) {
      return 'good';
    } else if (score >= 40) {
      return 'average';
    } else {
      return 'poor';
    }
  }

  getCompanyInitials(name: string): string {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  viewDetails(postulation: any) {
    console.log('View details for postulation:', postulation);
    this.selectedPostulation = postulation;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedPostulation = null;
  }

  bookInterview(postulation: any) {
    console.log('Booking interview for:', postulation);
    this.selectedPostulation = postulation;
    
    if (postulation.interviewConfirmed) {
      this.showConfirmationModal = true;
      if (postulation.interviewDate) {
        this.selectedDate = new Date(postulation.interviewDate);
        this.selectedTimeSlot = postulation.interviewTimeSlot || '';
      }
      return;
    }
    
    this.showInterviewModal = true;
    this.selectedDate = null;
    this.selectedTimeSlot = '';
    this.noDatesMessage = '';
    this.noSlotsMessage = '';
    
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
    
    this.generateAvailableDays();
  }

  closeInterviewModal() {
    this.showInterviewModal = false;
    this.selectedPostulation = null;
    this.selectedDate = null;
    this.selectedTimeSlot = '';
    this.noDatesMessage = '';
    this.noSlotsMessage = '';
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    
    this.generateAvailableDays();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    
    this.generateAvailableDays();
  }

  generateAvailableDays() {
  this.availableDays = [];
  this.availableAvailabilities = [];
  this.noDatesMessage = '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setMonth(today.getMonth() + 3);
  
  // Get all booked interviews first
  this.service.getAllInterviews().subscribe({
    next: (bookedInterviews) => {
      console.log('All booked interviews received:', bookedInterviews);
      
      this.calendarService.getAllAvailabilities().subscribe({
        next: (availabilities) => {
          console.log('All availabilities received:', availabilities);
          this.availableAvailabilities = availabilities
            .filter(avail => !avail.isAvailable && avail.id)
            .map(avail => {
              const [year, month, day] = avail.date.split('-').map(Number);
              return { date: new Date(year, month - 1, day), id: avail.id };
            })
            .filter(item => {
              const dayOfWeek = item.date.getDay();
              return item.date >= today && item.date <= endDate && dayOfWeek >= 1 && dayOfWeek <= 5;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
          
          this.availableDays = this.availableAvailabilities.map(item => item.date);
          console.log('Filtered available days:', this.availableDays);
          
          // Store booked interviews for later use in time slot filtering
          this.bookedInterviews = bookedInterviews || [];
          
          if (this.availableDays.length === 0) {
            this.noDatesMessage = 'No available interview dates found. Please try another month.';
          }
          
          this.updateCalendar();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching available days:', error);
          this.noDatesMessage = 'Unable to load available dates. Please try again later.';
          this.updateCalendar();
          this.cdr.detectChanges();
        }
      });
    },
    error: (error) => {
      console.error('Error fetching booked interviews:', error);
      // Continue with normal flow even if booked interviews can't be fetched
      this.calendarService.getAllAvailabilities().subscribe({
        next: (availabilities) => {
          console.log('All availabilities received:', availabilities);
          this.availableAvailabilities = availabilities
            .filter(avail => !avail.isAvailable && avail.id)
            .map(avail => {
              const [year, month, day] = avail.date.split('-').map(Number);
              return { date: new Date(year, month - 1, day), id: avail.id };
            })
            .filter(item => {
              const dayOfWeek = item.date.getDay();
              return item.date >= today && item.date <= endDate && dayOfWeek >= 1 && dayOfWeek <= 5;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
          
          this.availableDays = this.availableAvailabilities.map(item => item.date);
          console.log('Filtered available days:', this.availableDays);
          
          this.bookedInterviews = [];
          
          if (this.availableDays.length === 0) {
            this.noDatesMessage = 'No available interview dates found. Please try another month.';
          }
          
          this.updateCalendar();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching available days:', error);
          this.noDatesMessage = 'Unable to load available dates. Please try again later.';
          this.updateCalendar();
          this.cdr.detectChanges();
        }
      });
    }
  });
}

  updateCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    this.currentMonthName = monthNames[this.currentMonth];
  
    this.calendarDays = [];
  
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirstDay; i++) {
      this.calendarDays.push({ date: null });
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isAvailable = this.isDateAvailable(date);
      const isSelectable = date >= today && isAvailable && !isWeekend;
  
      this.calendarDays.push({
        date: date,
        available: isSelectable,
        isWeekend: isWeekend
      });
    }
    
    console.log('Calendar days updated:', this.calendarDays);
  }

  isDateAvailable(date: Date): boolean {
    if (!date) return false;
  
    return this.availableDays.some(d => 
      d.getFullYear() === date.getFullYear() && 
      d.getMonth() === date.getMonth() && 
      d.getDate() === date.getDate()
    );
  }

  isDateSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) return false;
  
    return date.getFullYear() === this.selectedDate.getFullYear() && 
           date.getMonth() === this.selectedDate.getMonth() && 
           date.getDate() === this.selectedDate.getDate();
  }

  selectInterviewDate(day: any) {
    if (!day.date || !day.available) return;
  
    this.selectedDate = new Date(day.date);
    console.log('Selected date:', this.selectedDate);
    this.generateTimeSlots();
    this.cdr.detectChanges();
  }

  generateTimeSlots() {
  this.availableTimeSlots = [];
  this.selectedTimeSlot = '';
  this.noSlotsMessage = '';

  if (!this.selectedDate) return;

  const availability = this.availableAvailabilities.find(avail => 
    avail.date.toDateString() === this.selectedDate!.toDateString()
  );

  if (availability && availability.id) {
    this.calendarService.getTimeSlotsByIdAndDate(availability.id, this.selectedDate).subscribe({
      next: (slots) => {
        // Get all available time slots
        const allAvailableSlots = slots
          .filter(slot => !slot.isAvailable)
          .map((slot: any) => slot.time);

        // Filter out booked time slots for the selected date
        const bookedSlotsForDate = this.bookedInterviews
          .filter(interview => {
            if (!interview.interviewDate) return false;
            const interviewDate = new Date(interview.interviewDate);
            return interviewDate.toDateString() === this.selectedDate!.toDateString();
          })
          .map(interview => {
            // Convert 24-hour format to 12-hour format for comparison
            const timeSlot = interview.interviewTimeSlot;
            if (timeSlot) {
              const [hours, minutes] = timeSlot.split(':').map(Number);
              const period = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
              return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
            }
            return null;
          })
          .filter(slot => slot !== null);

        console.log('Booked slots for selected date:', bookedSlotsForDate);

        // Filter out booked slots from available slots
        this.availableTimeSlots = allAvailableSlots
          .filter(slot => !bookedSlotsForDate.includes(slot))
          .sort((a: string, b: string) => a.localeCompare(b));

        console.log('Available time slots after filtering:', this.availableTimeSlots);
        
        if (this.availableTimeSlots.length === 0) {
          this.noSlotsMessage = 'No available time slots for this date.';
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching time slots:', error);
        this.noSlotsMessage = 'Unable to load time slots. Please try again.';
        this.cdr.detectChanges();
      }
    });
  } else {
    console.warn('No availability ID for date:', this.selectedDate);
    this.noSlotsMessage = 'No time slots available for this date.';
    this.cdr.detectChanges();
  }
}

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot = slot;
    console.log('Selected time slot:', slot);
    this.cdr.detectChanges();
  }

  confirmInterview() {
    if (!this.selectedDate || !this.selectedTimeSlot || !this.selectedPostulation?.id) {
      console.warn('Cannot confirm interview: missing date, time slot, or postulation ID', {
        selectedDate: this.selectedDate,
        selectedTimeSlot: this.selectedTimeSlot,
        postulationId: this.selectedPostulation?.id
      });
      alert('Please select a date and time slot, and ensure a valid postulation is selected');
      return;
    }
  
    console.log('Confirming interview for postulation:', {
      postulationId: this.selectedPostulation.id,
      date: this.selectedDate,
      timeSlot: this.selectedTimeSlot
    });
  
    // Parse AM/PM time slot
    let hours = 0;
    let minutes = 0;
    const timeParts = this.selectedTimeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeParts) {
      hours = parseInt(timeParts[1], 10);
      minutes = parseInt(timeParts[2], 10);
      const period = timeParts[3].toUpperCase();
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      console.error('Invalid time slot format:', this.selectedTimeSlot);
      alert('Invalid time slot format. Please select a valid time slot (e.g., 09:00 AM).');
      return;
    }
  
    const dateTime = new Date(this.selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
  
    // Convert to 24-hour format for interviewTimeSlot (e.g., "09:00", "21:00")
    const formattedTimeSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
    const bookingData = {
      interviewDate: dateTime.toISOString(), // e.g., "2025-06-02T09:00:00.000Z"
      interviewTimeSlot: formattedTimeSlot, // e.g., "09:00" or "21:00"
      interviewConfirmed: true
    };
  
    console.log('Sending booking data to backend:', bookingData);
  
    this.service.bookInterview(this.selectedPostulation.id, bookingData).subscribe({
      next: (response) => {
        console.log('Interview booked successfully:', response);
        if (response.success) {
          this.selectedPostulation.status = 'Interviewing';
          this.selectedPostulation.interviewDate = dateTime.toISOString();
          this.selectedPostulation.interviewTimeSlot = formattedTimeSlot;
          this.selectedPostulation.interviewConfirmed = true;
  
          this.showInterviewModal = false;
          this.showConfirmationModal = true;
  
          const index = this.listepostulation.findIndex(p => p.id === this.selectedPostulation.id);
          if (index !== -1) {
            this.listepostulation[index] = { ...this.selectedPostulation };
          }
          
          this.applyFilters();
          this.cdr.detectChanges();
        } else {
          console.warn('Booking failed:', response.message);
          alert(`Failed to book interview: ${response.message}`);
        }
      },
      error: (error) => {
        console.error('Error booking interview:', {
          status: error.status,
          message: error.message,
          error: error.error,
          bookingData
        });
        let errorMessage = 'Failed to book interview. Please try again.';
        if (error.status === 404) {
          errorMessage = 'Postulation not found. Please select a valid application.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid booking data. Please check your selection.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        alert(errorMessage);
      }
    });
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.selectedPostulation = null;
    this.selectedDate = null;
    this.selectedTimeSlot = '';
    this.cdr.detectChanges();
  }

  getChartImage(postulation: any): string {
    return postulation?.graphiqueResultat || postulation?.chartImage || '';
  }

  getMatchedSkills(postulation: any): string[] {
    try {
      if (!postulation?.matchedSkills) return [];
      if (typeof postulation.matchedSkills === 'string') {
        return JSON.parse(postulation.matchedSkills);
      }
      return postulation.matchedSkills;
    } catch (e) {
      return [];
    }
  }

  getMissingSkills(postulation: any): string[] {
    try {
      if (!postulation?.missingSkills) return [];
      if (typeof postulation.missingSkills === 'string') {
        return JSON.parse(postulation.missingSkills);
      }
      return postulation.missingSkills;
    } catch (e) {
      return [];
    }
  }

  downloadCV(postulation: any) {
    if (postulation?.cv) {
      const link = document.createElement('a');
      link.href = postulation.cv;
      link.download = `CV_${postulation?.condidat?.nom}_${postulation?.condidat?.prenom}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log('No CV available for this postulation');
    }
  }

  cancelPostulation(postulation: any) {
    if (confirm('Are you sure you want to cancel this application?')) {
      this.service.deletePostulation(postulation.id).subscribe(
        (response: any) => {
          this.listepostulation = this.listepostulation.filter(item => item.id !== postulation.id);
          this.applyFilters();
          alert('Application canceled successfully');
        },
        (error) => {
          console.error('Error canceling the application', error);
          alert('Error canceling the application');
        }
      );
    }
  }
}