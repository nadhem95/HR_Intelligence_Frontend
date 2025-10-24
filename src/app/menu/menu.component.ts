import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  IsloggedIn: boolean;
  userName: string = '';
  userPhotoUrl: string = 'assets/images/user/img-02.jpg'; // Default photo
  private defaultPhoto: string = 'assets/images/user/img-02.jpg';

  constructor(private service: CrudService, private router: Router) {}

  ngOnInit(): void {
    this.IsloggedIn = this.service.isLoggedIn();
    if (this.IsloggedIn) {
      const userInfo = this.service.getUserInfo();
      if (userInfo) {
        this.userName = `${userInfo.nom} ${userInfo.prenom}`;
        this.loadUserPhoto(userInfo.id);
      }
    }
  }

  /**
   * Load user photo from backend
   * @param userId - The user's ID
   */
  private loadUserPhoto(userId: number): void {
    this.service.getCandidatPhoto(userId).subscribe({
      next: (response) => {
        console.log('Photo response:', response); // Debug log
        
        // Check if response exists and has photo data
        if (response && response.photo && response.photo.trim() !== '') {
          this.userPhotoUrl = response.photo;
        } else {
          // No photo or empty photo, keep default
          this.userPhotoUrl = this.defaultPhoto;
        }
      },
      error: (error) => {
        console.log('No user photo found or error loading photo:', error);
        // Keep default photo if there's an error or no photo (404 means no photo)
        this.userPhotoUrl = this.defaultPhoto;
      }
    });
  }

  /**
   * Handle photo load error - fallback to default
   */
  onPhotoError(): void {
    this.userPhotoUrl = this.defaultPhoto;
  }

  logout() {
    console.log('logout');
    localStorage.clear();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}