export interface JournalEntry {
  id: string;
  packageId: string;
  packageName: string;
  sessionId: string;
  notaryId: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signerAddress: string;
  documentId: string;
  documentTitle: string;
  documentHash: string;
  notarialActType: string;
  idMethod: string;
  idNumberLast4: string;
  kbaStatus: string;
  credentialAnalysisStatus: string;
  platformUsed: string;
  videoRecordingLink: string;
  feeCollectedUsd: string;
  paymentReference: string;
  paymentMethod: string;
  sessionStartTime: string;
  sessionEndTime: string;
  status: string;
  notes: string;
  sessionInterruptionsReconnects: string;
  specialCircustances: string;
  platformVersion: string;
  notaryUserId: string;
  jurisdictionCommissionState: string;
  notaryFullName: string;
  notaryCommissionNumber: string;
  notaryCommissionExpiryDate: string;
  notaryDegitalCertificateId: string;
  dateOfNotarization: string;
  timeOfNotarization: string;
  timezone: string;
  typeOfNotarialAct: string;
  modeOfAppearance: string;
  recordingConsentCaptured: string;
  avRecordingFileId: string;
  recordingRetentionPeriod: number;
  notaryPhysicalLocation: string;
  signerDeclaredLocation: string;
  signers: any;
  documents: any;
  ronFinalizedTimestamp: string;
  notaryDigitalSealApplied: string;
  auditTrialEnabled: string;
  entryLockedAgainstModification: string;


}

export interface JournalResponse {
  journalEntries: JournalEntry[];
}
