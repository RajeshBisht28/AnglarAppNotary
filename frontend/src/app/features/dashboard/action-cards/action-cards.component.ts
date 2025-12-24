import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from 'src/app/shared';

export interface ActionCard {
  title: string;
  description: string;
  buttonText: string;
  icon: string;
  type: 'notarize' | 'esign';
}

@Component({
  selector: 'app-action-cards',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './action-cards.component.html',
  styleUrls: ['./action-cards.component.scss']
})
export class ActionCardsComponent {
  @Input() userName: string = 'User';
  @Input() actionCards: ActionCard[] = [
    {
      title: 'Notarize now',
      description: 'Notarize your document online in minutes. Prices start at $25.',
      buttonText: 'Notarize now',
      icon: 'verified',
      type: 'notarize'
    },
    {
      title: 'eSign now',
      description: 'Sign documents electronically for $4.',
      buttonText: 'eSign now',
      icon: 'edit',
      type: 'esign'
    }
  ];
  @Output() actionClicked = new EventEmitter<string>();

  onActionClick(type: string): void {
    this.actionClicked.emit(type);
  }
}
