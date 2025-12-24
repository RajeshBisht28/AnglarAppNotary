import { Signer } from "./signer.model";

export interface Package {
  signers: Signer[];
  documents: Document[];
}

export interface UserPackage {
  id: string;
  lnPackageName: string;
  lnPackageDesc: string;
  lnPackageStatus: string;
  expirationOn: string;
  idDocumentVerified: boolean;
  isPaymentDone: boolean;
  meAsSignerId: string
  signers: Signer[];
  createdDate?: string;
  updatedDate?: string;
}

export interface PackageResponse {
  packages: UserPackage[];
}

export interface Document {
  documentBase64: string;
  fileExtension: string;
  name: string;
  documentId: number;
  pages: Page[];
}

export interface Page {
  pageNumber: number;
  pageBasePdf64: string;
  pageBaseImage64: string;
  pageURL: string;
  height: number;
  width: number;
}


export interface StandardField {
  id: number;
  name: string;
  type?: string;
  height?: number;
  width?: number;
  UUID?: string;
  standardTag?: string
}
