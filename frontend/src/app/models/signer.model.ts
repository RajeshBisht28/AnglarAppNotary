import { SignerRole } from "./signerRole.enum";

export interface PackageSigner {
  signers: Signer[];
  status?: string;
}
export interface Signer {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  recipientId: number;
  routingOrder: number;
  status: string;
  role: SignerRole
  fields: FieldInfo[];
}

export interface FieldInfo {
  UUID: string;
  documentId: number;
  name: string;
  signerName: string;
  pageNumber: number;
  tabLabel: string;
  xPosition: number;
  yPosition: number;
  recipientId?: number;
  type: string;
  standardTagId: number;
  standardTagName?: string;
  standardTag?: string;
  highlight: boolean;
  pageSeq?: number;
  isRequired?: string;
  fontSize?: number | string;
  font?: string;
  defaultCurrentDate?: string;

  // Optional from earlier interface (keep for flexibility)
  tooltip?: string;
  tabOrder?: string;
  value?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  fontColor?: string;
  tabId?: string;
  pageHeight?: number;
  pageWidth?: number;
  isDeleted?: boolean;
}
