import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageApiService } from 'src/app/core/services/business/package-api.service';
import { LoadingComponent, SHARED_IMPORTS } from 'src/app/shared';
import { downloadZipFromUrl } from 'src/app/utils/download-doc-util';
import { AuthService } from 'src/app/core';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [...SHARED_IMPORTS, LoadingComponent],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  userId!: string;
  packageId!: string;
  sessionId!: string;
  token!: string;
  user: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageApiService,
    private authUser: AuthService,
  ) {
    this.user = this.authUser.getUser();
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId')!;
    this.packageId = this.route.snapshot.paramMap.get('packageId')!;

    this.sessionId = this.route.snapshot.queryParamMap.get('session_id')!;
    this.token = this.route.snapshot.queryParamMap.get('token')!;

    this.successApiCall();
  }
  
   onDownload() {
    this.packageService.downloaPackagedDocument(this.packageId).subscribe({
      next: (data: any) => {
        downloadZipFromUrl(data.documentUrl, `${data.lnPackageName}.zip`);
      },
    });
  }

  goToDashboard() {
    if(this.user.userType === 'Notary'){
      this.router.navigate(['/notary-user/dashboard']);
    }else{
      this.router.navigate(['/user/dashboard']);
    }
  }

  successApiCall() {
    const body = {
      session_id: this.sessionId
    }
    this.packageService.paymentSuccess(this.packageId, this.userId, body)
    .subscribe(data=>{})
  }

}
