import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Offre } from '../Entites/Offre.Entites';

@Component({
  selector: 'app-offre',
  templateUrl: './offre.component.html',
  styleUrls: ['./offre.component.css']
})
export class OffreComponent {
  IsloggedIn: boolean;
  listeOffre: Offre[];
  expandedDescriptions: { [key: number]: boolean } = {};
  
  // Filtres
  experienceLevels = ['No experience', '0-3 years', '3-6 years', 'More than 6 years'];
  employmentTypes = ['Freelance', 'Full Time', 'Internship', 'Part Time'];
  datePostedOptions = ['Last 24 hours', 'Last 7 days', 'Last month'];

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.loadOffres();
    this.IsloggedIn = this.service.isLoggedIn();
  }

  loadOffres(): void {
    this.service.getAllOffres().subscribe(offres => {
      this.listeOffre = offres.map(offre => ({
        ...offre,
        datePublication: offre.datePublication || this.getRandomTimeAgo()
      }));
    });
  }

  private getRandomTimeAgo(): Date {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setHours(date.getHours() - hours);
    date.setMinutes(date.getMinutes() - minutes);
    return date;
  }

  calculateTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${Math.floor(diffInSeconds)} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  toggleDescription(offreId: number): void {
    this.expandedDescriptions[offreId] = !this.expandedDescriptions[offreId];
  }

  isDescriptionExpanded(offreId: number): boolean {
    return this.expandedDescriptions[offreId] || false;
  }

  postuler(offreId: number): void {
    this.router.navigate(["/postulation/"+offreId]).then(() => {
      window.location.reload();
    });
  }
}