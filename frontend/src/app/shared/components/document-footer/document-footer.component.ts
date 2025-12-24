import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StepService } from 'src/app/features/document/service/step.service';
import { Subscription } from 'rxjs';
import { SHARED_IMPORTS } from '../../material';
import { AuthService } from 'src/app/core';

@Component({
  selector: 'document-footer',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './document-footer.component.html',
  styleUrls: ['./document-footer.component.scss']
})
export class DocumentFooterComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  currentIndex = 0;
  private readonly allStepsOrder = ['document', 'participants', 'sign', 'id-verification', 'session', 'payment'];
  stepsOrder: string[] = [];
  user: any;
  isNotaryUser = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stepService: StepService,
    public authService: AuthService
  ) {
    this.user = authService.getUser();
    this.initializeStepsOrder();
  }

  ngOnInit(): void {
    this.sub.add(
      this.router.events.subscribe(() => {
        this.updateIndexFromUrl();
      })
    );
    this.updateIndexFromUrl();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private initializeStepsOrder(): void {
    this.isNotaryUser = this.user?.userType === 'Notary' || this.user?.role === 'Notary';

    if (this.isNotaryUser) {
      this.stepsOrder = this.allStepsOrder.filter(
        (step) => step !== 'id-verification' && step !== 'payment'
      );
    } else {
      this.stepsOrder = this.allStepsOrder;
    }
  }

  private updateIndexFromUrl(): void {
    const child = this.route.firstChild?.snapshot.routeConfig?.path || '';
    const idx = this.stepsOrder.indexOf(child);
    this.currentIndex = idx >= 0 ? idx : 0;
  }

  onPrev(): void {
    this.stepService.emitPrev();
    if (this.currentIndex > 0) {
      const prev = this.stepsOrder[this.currentIndex - 1];
      this.router.navigate([prev], { relativeTo: this.route });
    }
  }

  onNext(): void {
    this.stepService.emitNext();
    if (this.currentIndex < this.stepsOrder.length - 1) {
      const next = this.stepsOrder[this.currentIndex + 1];
    }
  }

  get canGoPrev(): boolean {
    return this.currentIndex > 0;
  }

  get isLast(): boolean {
    return this.currentIndex === this.stepsOrder.length - 1;
  }
}
