export interface NotaryInformation {
  firstName: string;
  lastName: string;
  email: string;
  commissionNumber: string;
  commissionExpiryDate: string;
  jurisdiction: string;
  phone: string;
}

export interface ProfileCertificate {
  id: string;
  field: 'PhotoId' | 'NotaryCommissionCertificate' | 'AdditionalCertificate';
  name: string;
  base64Content: string;
}

export interface DigitalSeal {
  id: string;
  sealStyle: string;
  sealUpperText: string;
  sealLowerText: string;
  sealName: string;
  sealBase64Content: string;
  sealExpiryDate: string;
  notaryId: string;
}

export interface CompleteRegistration {
  id: string;
  altEmail: string;
  userName: string;
  password: string;
}

export enum signerType {
   Applicant,
   Witness,
   Notary
}
