import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from 'src/app/shared';

interface CardItem { title: string; value: number | string; icon: string; }

@Component({
  selector: 'app-dashboard-cards',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './dashboard-cards.component.html',
  styleUrls: ['./dashboard-cards.component.scss']
})
export class DashboardCardsComponent {
  @Input() cards: CardItem[] = [];
}
