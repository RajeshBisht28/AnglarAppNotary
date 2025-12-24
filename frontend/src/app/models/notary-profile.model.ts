export interface NotaryProfileResponse {
  id: string,
  alisName: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  jobTitle?: string;

  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipcode: string;

  phone: string;
  fax?: string;
  altEmail?: string;

  commissionNumber: string;
  commissionExpiryDate: string;
  jurisdiction: string;
  notaryId: string;

  calendlyPublicSessionUrl?: string;

  photoIdBase64?: string;
  commissionCertificateBase64?: string;
  additionalCertificateBase64?: string;
  seals?: SealResponse[];
}

export interface SealResponse {
  sealStyle: 'circle' | 'rectangle';
  sealUpperText: string;
  sealLowerText: string;
  sealExpiryDate: string;
  sealBase64Content: string;
  notaryId: string
}

