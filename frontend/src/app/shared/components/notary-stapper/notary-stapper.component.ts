import { Component, Input } from '@angular/core';
import { SHARED_IMPORTS } from '../../material/shared-import';

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS],
  selector: 'notary-stepper',
  templateUrl: './notary-stapper.component.html',
  styleUrls: ['./notary-stapper.component.scss']
})
export class NotaryStapperComponent {
  @Input() steps: {label: string, icon: string}[] = [];
  @Input() currentStep = 1;

  isCompleted(stepIndex: number): boolean {
    return stepIndex < this.currentStep;
  }

  isCurrent(stepIndex: number): boolean {
    return stepIndex === this.currentStep - 1;
  }
}
