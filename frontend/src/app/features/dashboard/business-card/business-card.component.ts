import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-business-card',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './business-card.component.html',
  styleUrls: ['./business-card.component.scss']
})
export class BusinessCardComponent {
  @Input() title: string = 'Get Leaflet eNotary for Business';
  @Input() description: string = 'Need someone else to sign, notarize, or verify? Get Leaflet eNotary for Business - just pay per transaction.';
  @Input() buttonText: string = 'Get Business Pro now';
  @Output() businessAction = new EventEmitter<void>();

  onBusinessAction(): void {
    this.businessAction.emit();
  }
}
