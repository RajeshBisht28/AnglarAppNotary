import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { StepService } from '../service/step.service';
import { Subscription } from 'rxjs';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { AuthService } from 'src/app/core';

declare const Stripe: any;

@Component({
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent],
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  packageId!: string | null | undefined;
  private sub: Subscription = new Subscription();
  paymentHandler: any = null;
  user!: any;
  stripeKey!: string;
  stripeLoaded = false; 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stepService: StepService,
    private packageApiService: PackageApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.packageId = this.route.parent?.snapshot.paramMap.get('id');
    this.sub.add(this.stepService.next$.subscribe(() => this.onSubmit()));
    this.sub.add(this.stepService.prev$.subscribe(() => this.onPrevious()));
    this.initStripe();
  }

  async initStripe() {
    this.packageApiService.getStripDetails().subscribe(async (data: any) => {
      this.stripeKey = data.publishableKey;

      if (!window.document.getElementById('stripe-script')) {
        const script = window.document.createElement('script');
        script.id = 'stripe-script';
        script.type = 'text/javascript';
        script.src = 'https://checkout.stripe.com/checkout.js';

        script.onload = () => {
          this.paymentHandler = (window as any).StripeCheckout.configure({
            key: this.stripeKey,
            locale: 'auto',
            token: (stripeToken: any) => {

            },
          });

          this.stripeLoaded = true;
          this.chargePayment();
        };

        window.document.body.appendChild(script);
      } else {
        this.stripeLoaded = true;
        this.chargePayment();
      }
    });
  }


  chargePayment() {
    if (!this.stripeLoaded) {
      console.warn('Stripe not yet initialized — delaying charge.');
      return;
    }

    this.packageApiService.chargePayment(this.user.userId, this.packageId!)
      .subscribe((stripeSession) => {
        const stripeObj = Stripe(this.stripeKey);
        stripeObj
          .redirectToCheckout({
            sessionId: stripeSession.id,
          })
          .then((result: any) => {
            if (result.error) {
              console.error('Stripe redirect error:', result.error.message);
            }
          });
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onPrevious(): void {
    if (this.packageId) {
      this.router.navigate(['/document/package', this.packageId, 'session']);
    }
  }

  onSubmit(): void { }
}
