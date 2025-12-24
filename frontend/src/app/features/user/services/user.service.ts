import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

export interface DocumentItem {
  id: number;
  name: string;
  description: string;
  status: string;
  createdDate: string;
  documentType: string;
}

export interface UpcomingSession {
  id: number;
  title: string;
  notaryName: string;
  scheduledDate: string;
  status: string;
}

export interface FavoriteNotary {
  id: number;
  name: string;
  email: string;
  phone: string;
  rating: number;
}

export interface TableColumn {
  id: string;
  label: string;
  sortable: boolean;
  width?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/user/dashboard'
    },
    {
      label: 'Document Vault',
      icon: 'content_paste_search',
      route: '/user/document-vault'
    },
    {
      label: 'Upcoming Sessions',
      icon: 'event',
      route: '/user/upcoming-sessions'
    },
    {
      label: 'Favorite Notary Persons',
      icon: 'favorite',
      route: '/user/favorite-notary'
    }
  ]);

  private documentsSubject = new BehaviorSubject<DocumentItem[]>([
    {
      id: 1,
      name: 'Employment Contract',
      description: 'Full-time employment agreement',
      status: 'Signed',
      createdDate: '2024-01-15',
      documentType: 'Contract'
    },
    {
      id: 2,
      name: 'Property Deed',
      description: 'Real estate property transfer',
      status: 'Pending',
      createdDate: '2024-01-10',
      documentType: 'Real Estate'
    },
    {
      id: 3,
      name: 'Power of Attorney',
      description: 'Legal power of attorney document',
      status: 'Signed',
      createdDate: '2024-01-05',
      documentType: 'Legal'
    },
    {
      id: 4,
      name: 'Business Agreement',
      description: 'Partnership agreement document',
      status: 'Draft',
      createdDate: '2024-01-20',
      documentType: 'Business'
    }
  ]);

  private upcomingSessionsSubject = new BehaviorSubject<UpcomingSession[]>([
    {
      id: 1,
      title: 'Document Notarization',
      notaryName: 'John Doe',
      scheduledDate: '2024-02-15 10:00 AM',
      status: 'Scheduled'
    },
    {
      id: 2,
      title: 'Contract Review',
      notaryName: 'Jane Smith',
      scheduledDate: '2024-02-20 2:00 PM',
      status: 'Scheduled'
    }
  ]);

  private favoriteNotariesSubject = new BehaviorSubject<FavoriteNotary[]>([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0101',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-0102',
      rating: 4.9
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert@example.com',
      phone: '+1-555-0103',
      rating: 4.7
    }
  ]);

  private documentColumnsSubject = new BehaviorSubject<TableColumn[]>([
    { id: 'name', label: 'Document Name', sortable: true, width: '25%' },
    { id: 'description', label: 'Description', sortable: false, width: '25%' },
    { id: 'documentType', label: 'Type', sortable: true, width: '15%' },
    { id: 'status', label: 'Status', sortable: true, width: '15%' },
    { id: 'createdDate', label: 'Created', sortable: true, width: '15%' },
    { id: 'actions', label: 'Actions', sortable: false, width: '5%' }
  ]);

  menuItems$ = this.menuItemsSubject.asObservable();
  documents$ = this.documentsSubject.asObservable();
  upcomingSessions$ = this.upcomingSessionsSubject.asObservable();
  favoriteNotaries$ = this.favoriteNotariesSubject.asObservable();
  documentColumns$ = this.documentColumnsSubject.asObservable();

  constructor() {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems$;
  }

  updateMenuItems(items: MenuItem[]): void {
    this.menuItemsSubject.next(items);
  }

  getDocuments(): Observable<DocumentItem[]> {
    return this.documents$;
  }

  updateDocuments(documents: DocumentItem[]): void {
    this.documentsSubject.next(documents);
  }

  getUpcomingSessions(): Observable<UpcomingSession[]> {
    return this.upcomingSessions$;
  }

  getDocumentColumns(): Observable<TableColumn[]> {
    return this.documentColumns$;
  }

  updateDocumentColumns(columns: TableColumn[]): void {
    this.documentColumnsSubject.next(columns);
  }

  getFavoriteNotaries(): Observable<FavoriteNotary[]> {
    return this.favoriteNotaries$;
  }

  deleteDocument(id: number): void {
    const current = this.documentsSubject.value;
    this.documentsSubject.next(current.filter(doc => doc.id !== id));
  }

  updateDocumentStatus(id: number, status: string): void {
    const current = this.documentsSubject.value;
    const updated = current.map(doc => 
      doc.id === id ? { ...doc, status } : doc
    );
    this.documentsSubject.next(updated);
  }
}
