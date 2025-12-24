import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_IMPORTS } from 'src/app/shared';
import { RouterModule, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-account-verification-success',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, RouterModule],
  templateUrl: './account-verification-success.component.html',
  styleUrls: ['./account-verification-success.component.scss']
})
export class AccountVerificationSuccessComponent {
  lnentryid: string | null = null;
  LNUID: string | null = null;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.lnentryid = this.route.snapshot.queryParamMap.get('lnentryid');
    this.LNUID = this.route.snapshot.queryParamMap.get('LNUID');
  }
}
