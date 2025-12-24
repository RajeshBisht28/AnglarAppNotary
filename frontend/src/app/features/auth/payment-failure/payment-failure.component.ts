import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED_IMPORTS } from 'src/app/shared';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './payment-failure.component.html',
  styleUrls: ['./payment-failure.component.scss']
})
export class PaymentFailureComponent implements OnInit {
  userId!: string;
  packageId!: string;
  sessionId!: string;
  token!: string;

  constructor(private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userId = this.route.parent?.snapshot.paramMap.get('userId')!;
    this.packageId = this.route.snapshot.paramMap.get('packageId')!;

    this.sessionId = this.route.snapshot.queryParamMap.get('session_id')!;
    this.token = this.route.snapshot.queryParamMap.get('token')!;
  }

  retryPayment(): void {
    this.router.navigate(['/document/package', this.packageId, 'payment']);
  }

  contactSupport(): void {
  }
}
