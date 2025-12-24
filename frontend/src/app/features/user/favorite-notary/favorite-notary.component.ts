import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_IMPORTS } from 'src/app/shared';
import { UserService, FavoriteNotary } from '../services/user.service';

@Component({
  selector: 'app-favorite-notary',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS],
  templateUrl: './favorite-notary.component.html',
  styleUrls: ['./favorite-notary.component.scss']
})
export class FavoriteNotaryComponent implements OnInit {
  notaries: FavoriteNotary[] = [];
  isLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadNotaries();
  }

  private loadNotaries(): void {
    this.isLoading = true;
    this.userService.getFavoriteNotaries().subscribe(notaries => {
      this.notaries = notaries;
      this.isLoading = false;
    });
  }

  onScheduleSession(notary: FavoriteNotary): void {
    console.log('Schedule session with:', notary.id);
  }

  onViewProfile(notary: FavoriteNotary): void {
    console.log('View profile:', notary.id);
  }

  onSendMessage(notary: FavoriteNotary): void {
    console.log('Send message to:', notary.id);
  }

  onRemoveFavorite(notary: FavoriteNotary): void {
    console.log('Remove from favorites:', notary.id);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getRatingLabel(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    return 'Fair';
  }
}
