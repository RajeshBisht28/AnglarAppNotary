import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { Package, StandardField } from 'src/app/models/package.model';
import { PackageSigner, Signer } from 'src/app/models/signer.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PackageApiService {

  private BASE_URL = environment.API_URL + environment.API_PATH;

  constructor(private http: HttpClient) { }

  packageCreate(body: { packageName: string, description: string }): Observable<any> {
    const url = `${this.BASE_URL}/ln-packages/create`;
    return this.http.post<any>(url, body);
  }

  uploadDocument = (
    packageId: any,
    body: any
  ): Observable<any> =>
    this.http
      .post(`${this.BASE_URL}/eNotary/packages/${packageId}/document-upload`, body)
      .pipe(map((data: any) => data));


  getAllDocument = (
    packageId: string,
  ): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/documents`,)
      .pipe(map((data: any) => data.documents));

  uploadIdDocument = (
    packageId: string,
    body: { id: number; documentBase64Content: string; documentName: string; documentType: string; documentSide: 'Front' | 'Back' }
  ): Observable<any> =>
    this.http
      .post(`${this.BASE_URL}/eNotary/packages/${packageId}/id-document/upload`, body)
      .pipe(map((data: any) => data));


  addPariicipants = (
    packageId: any,
    body: any
  ): Observable<any> =>
    this.http
      .post(`${this.BASE_URL}/packages/${packageId}/participants`, body)
      .pipe(map((data: any) => data));

  deleteParticipants = (
    packageId: any,
    participantId: any
  ): Observable<any> =>
    this.http
      .delete(`${this.BASE_URL}/packages/${packageId}/participants/${participantId}`)
      .pipe(map((data: any) => data));


  getAllParticipants = (
    packageId: any,
  ): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/packages/${packageId}/participants`,)
      .pipe(map((data: any) => data));

  getSignFields = (): Observable<StandardField[]> =>
    this.http
      .get(`${this.BASE_URL}/standard-fields`)
      .pipe(map((data: any) => data.standardField));

  getPackage = (
    packageId: string,
  ): Observable<Package> =>
    forkJoin([
      this.getAllDocument(packageId),
      this.getPackageSigners(packageId),
    ]).pipe(map(([documents, signers]) => ({ documents, signers })));


  getPackageSigners = (packageId: string): Observable<Signer[]> =>
    this.http
      .get(`${this.BASE_URL}/packages/${packageId}/fields`)
      .pipe(map((data: any) => data.signers));


  savePackage = (
    packageId: string,
    signers: Signer[],
  ): Observable<any> => {
    const envelope: PackageSigner = {
      signers,
    };
    return this.http.post(
      `${this.BASE_URL}/packages/${packageId}/fields`,
      envelope
    );
  };

  getQRCode = (packageId: string, userId: string, type: string, country: string): Observable<any[]> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/users/${userId}/id/${type}/region/${country}`)
      .pipe(map((data: any) => data));

  getVerificationStatus = (packageId: string): Observable<{ status?: string; isIdDocumentVerified?: string; extractedData?: string }> =>
    this.http.get<{ status?: string; isIdDocumentVerified?: string; extractedData?: string }>(`${this.BASE_URL}/eNotary/packages/${packageId}/verification-status`);

  signForSigner = (
    packageId: string,
    signerId: number
  ): Observable<{ signature: string; initials: string; signerInitials?: string; signerName?: string }> =>
    this.http
      .get<any>(
        `${this.BASE_URL}/eNotary/packages/${packageId}/signer/${signerId}/sign`,
      )
      .pipe(
        map((data: any) => ({
          signature: data?.signImage64 || '',
          initials: data?.intitialsImage64 || '',
          signerInitials: data?.signerInitials,
          signerName: data?.signerName,
        }))
      );

  signerSignedDocument = (
    packageId: string,
    signer: Signer
  ): Observable<any> => {
    return this.http.post(
      `${this.BASE_URL}/eNotary/packages/${packageId}/signature`,
      signer
    );
  }

  getStripDetails = (): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/admin/stripe-details`,)
      .pipe(map((data: any) => data));

  getSignature = (signerName: string, imageType: 'signature' | 'initial', initialName?: string): Observable<any> => {
    let url = `${this.BASE_URL}/eNotary/signatures?signerName=${encodeURIComponent(signerName)}&imageType=${imageType}`;
    if (imageType === 'initial' && initialName) {
      url += `&initialName=${encodeURIComponent(initialName)}`;
    }
    return this.http.get(url).pipe(map((data: any) => data));
  };

  chargePayment = (userId: string, packageId: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/admin/user/${userId}/package/${packageId}/charge`,)
      .pipe(map((data: any) => data));

   
    paymentSuccess = (
    packageId: string,
    userId: string,
    body: any
  ): Observable<any> => {
    return this.http.post(
      `${this.BASE_URL}/eNotary/admin/user/${userId}/package/${packageId}/payment-success`,
       body
    );
  }

  downloadDocument = (packageId: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/download`,)
      .pipe(map((data: any) => data.documentUrl));

  downloaPackagedDocument = (packageId: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/packages/${packageId}/download`,)
      .pipe(map((data: any) => data));

  uploadFaceCapture = (
    packageId: string,
    faceBase64Content: string
  ): Observable<any> =>
    this.http
      .post(`${this.BASE_URL}/eNotary/packages/${packageId}/face-match`, {
        faceBase64Content
      })
      .pipe(map((data: any) => data));

  deleteDocument = (documentId: string): Observable<any> =>
    this.http
      .delete(`${this.BASE_URL}/eNotary/documents/${documentId}`)
      .pipe(map((data: any) => data));

  getCalendlyUrl = (packageId: string): Observable<any> =>
    this.http
      .get(`${this.BASE_URL}/eNotary/package/${packageId}/calendly_url`,)
      .pipe(map((data: any) => data));

  sendPackageLink(body: { email: string; packageUrl: string; packageId: string }): Observable<any> {
    const url = `${this.BASE_URL}/ln-packages/send-package-link`;
    return this.http.post<any>(url, body);
  }

  getSignerIdDocuments = (
    packageId: string,
    signerId: string
  ): Observable<any[]> =>
    this.http
      .get<any[]>(`${this.BASE_URL}/eNotary/packages/${packageId}/signer/${signerId}/id-documents`)
      .pipe(map((data: any) => data || []));

}
