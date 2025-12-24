export interface Notary {
  firstName: string;
  lastName: string;
  notaryId: number;
  email: string;
}

export type SessionType = 'Instant' | 'Scheduled';
